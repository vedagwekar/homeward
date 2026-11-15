"use client";

import { nextStage, rupees } from "@/lib/project.mjs";
import { act, activeStage, startStage, updateStage, useProjects, useStatus } from "@/lib/store";
import GateTrack from "../gate-track";

// The builder's one screen: what to do now, the code to film, and when the money comes. Keep it light for Android.
export default function Builder() {
  const projects = useProjects();
  const active = activeStage(projects);
  const busy = useStatus().state === "loading";

  if (!active) {
    // Nothing open: offer the next locked stage. In a real launch Homeward opens it once the family has funded it.
    const project = projects.find((p) => !p.frozen && nextStage(p));
    const next = project && nextStage(project);
    const waiting = next && next.stillNeeded > 0;
    return (
      <>
        <h1>No job open right now</h1>
        {project && next ? (
          <>
            <p className="task">
              Next is {next.stage.name.toLowerCase()} at {project.name}.{" "}
              {waiting ? `The family still has to add ${rupees(next.stillNeeded)} before it can start.` : "It is funded and ready to start."}
            </p>
            {!waiting && (
              <>
                <button
                  className="button"
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    act({ loading: `Starting ${next.stage.name}`, done: `${next.stage.name} started. Supplier paid for materials` }, () =>
                      startStage(project.id, next.stage.slug),
                    )
                  }
                >
                  Start {next.stage.name.toLowerCase()}
                </button>
                <p className="hint">Starting pays the supplier {rupees(next.stage.materials)} for materials straight away.</p>
              </>
            )}
          </>
        ) : (
          <p className="task">Every stage is finished.</p>
        )}
      </>
    );
  }

  const { project, stage } = active;
  const pay = rupees(stage.amount - stage.materials);
  const sent = stage.status === "submitted";
  const task = sent
    ? `Your video is with the engineer. You and your workers get ${pay} when it passes.`
    : stage.status === "rejected"
      ? "The engineer sent this back. Fix the work, film it again with the code in the shot, and send it."
      : `Film the finished work with this code in the shot, then send it. You and your workers get ${pay} when it passes.`;
  return (
    <>
      <h1>{stage.name}</h1>
      <p className="intro">
        {project.name}, {project.place}
      </p>
      <p className="task">{task}</p>

      {!sent && (
        <>
          <section className="group pad center">
            <small>Today's code. Show it on camera</small>
            <p className="code">{stage.code}</p>
          </section>
          <button
            className="button"
            type="button"
            disabled={busy}
            onClick={() =>
              act({ loading: "Sending the video", done: "Video sent to the engineer" }, () =>
                updateStage(project.id, stage.slug, { status: "submitted", engineerDecision: null, secondDecision: null, amma: null }),
              )
            }
          >
            {stage.status === "rejected" ? "Send the new video" : "Send the video"}
          </button>
          <p className="hint">Demo: this sends a sample video.</p>
        </>
      )}

      <h3>Before you are paid</h3>
      <section className="group pad">
        <GateTrack project={project} stage={stage} />
      </section>
    </>
  );
}

"use client";

import { depositNeeded, nextStage, rupees } from "@/lib/project.mjs";
import { act, activeStage, postDeposit, startStage, updateStage, useProjects, useStatus } from "@/lib/store";
import GateTrack from "../gate-track";
import BuilderSecurity from "./security";

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
    const needDeposit = Boolean(project && depositNeeded(project));
    // The home whose deposit to show, even when every stage is finished.
    const secured = project ?? projects.find((p) => p.security);
    return (
      <>
        <h1>No job open</h1>
        {project && next ? (
          <>
            <p className="task">
              Next: {next.stage.name}. {waiting ? `Waiting for ${rupees(next.stillNeeded)} from the family.` : needDeposit ? `Put in your ${rupees(project.security!.depositTarget)} deposit first.` : "Ready to start."}
            </p>
            {!waiting && needDeposit && (
              <button className="button" type="button" disabled={busy} onClick={() => act({ loading: "Putting in your deposit", done: "Deposit is in" }, () => postDeposit(project.id))}>
                Put in {rupees(project.security!.depositTarget)}
              </button>
            )}
            {!waiting && !needDeposit && (
              <>
                <button
                  className="button"
                  type="button"
                  disabled={busy}
                  onClick={() => act({ loading: `Starting ${next.stage.name}`, done: `${next.stage.name} started. Supplier paid` }, () => startStage(project.id, next.stage.slug))}
                >
                  Start {next.stage.name.toLowerCase()}
                </button>
                <p className="hint">Pays the supplier {rupees(next.stage.materials)}.</p>
                {project.security && project.security.deposit < project.security.depositTarget && (
                  <p className="hint">Your first payment fills the {rupees(project.security.depositTarget)} deposit.</p>
                )}
              </>
            )}
          </>
        ) : (
          <p className="task">Every stage is finished.</p>
        )}
        {secured && <BuilderSecurity project={secured} />}
      </>
    );
  }

  const { project, stage } = active;
  const sent = stage.status === "submitted";
  const task = sent ? "With the engineer." : stage.status === "rejected" ? "Sent back. Fix it, film again." : "Film the work. Show this code.";
  return (
    <>
      <h1>{stage.name}</h1>
      <p className="intro">{project.name}</p>
      <p className="task">{task}</p>

      {!sent && (
        <>
          <section className="group pad center">
            <small>Today's code</small>
            <p className="code">{stage.code}</p>
          </section>
          <button
            className="button"
            type="button"
            disabled={busy}
            onClick={() =>
              act({ loading: "Sending", done: "Video sent" }, () =>
                updateStage(project.id, stage.slug, { status: "submitted", engineerDecision: null, secondDecision: null, amma: null }),
              )
            }
          >
            {stage.status === "rejected" ? "Send new video" : "Send video"}
          </button>
          <p className="hint">Demo: sends a sample video.</p>
        </>
      )}

      <h3>Your payment</h3>
      <section className="group pad">
        <GateTrack project={project} stage={stage} />
      </section>
      <BuilderSecurity project={project} />
    </>
  );
}

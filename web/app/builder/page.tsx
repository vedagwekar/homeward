"use client";

import { nextStage, rupees } from "@/lib/project.mjs";
import { act, activeStage, startStage, updateStage, useProjects, useStatus } from "@/lib/store";

// Rivan owns this screen. Keep it light for Android.
export default function Builder() {
  const projects = useProjects();
  const active = activeStage(projects);
  const busy = useStatus().state === "loading";
  if (!active) {
    // Nothing open: offer the next locked stage. In a real launch Homeward opens it once the family has funded it.
    const project = projects.find((p) => !p.frozen && nextStage(p));
    const next = project && nextStage(project);
    return (
      <>
        <h1>Builder</h1>
        <p className="intro">No stage needs proof right now.</p>
        {project && next && (
          <>
            <button
              className="button"
              type="button"
              disabled={busy || next.stillNeeded > 0}
              onClick={() =>
                act({ loading: `Starting ${next.stage.name}`, done: `${next.stage.name} started. Supplier paid for materials` }, () =>
                  startStage(project.id, next.stage.slug),
                )
              }
            >
              Start {next.stage.name}
            </button>
            <p className="note">
              {next.stillNeeded > 0
                ? `${project.name} needs ${rupees(next.stillNeeded)} more funding before this stage can start.`
                : "Demo step: Homeward opens a stage once it's funded. The supplier is paid for materials straight away."}
            </p>
          </>
        )}
      </>
    );
  }
  const { project, stage } = active;
  return (
    <>
      <h1>{stage.name}</h1>
      <p className="intro">{project.name}</p>
      <section className="group pad center">
        <small>Show this code on camera</small>
        <p className="code">{stage.code}</p>
        <small>You and your labour receive {rupees(stage.amount - stage.materials)} after approval. The supplier was paid {rupees(stage.materials)} when this stage opened.</small>
      </section>
      {stage.status === "rejected" && <p className="note">The engineer asked for fixes. Fix the work, then send new proof.</p>}
      {stage.status === "submitted" ? (
        <p className="note">Proof sent. Waiting for the engineer.</p>
      ) : (
        <button
          className="button"
          type="button"
          disabled={busy}
          onClick={() => act({ loading: "Sending proof", done: "Proof sent" }, () => updateStage(project.id, stage.slug, { status: "submitted", engineerDecision: null, secondDecision: null, amma: null }))}
        >
          {stage.status === "rejected" ? "Send new proof" : "Send sample proof"}
        </button>
      )}
    </>
  );
}

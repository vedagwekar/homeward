"use client";

import { rupees } from "@/lib/project.mjs";
import { act, activeStage, updateStage, useProjects, useStatus } from "@/lib/store";

// Rivan owns this screen. Keep it light for Android.
export default function Builder() {
  const active = activeStage(useProjects());
  const busy = useStatus().state === "loading";
  if (!active) {
    return (
      <>
        <h1>Builder</h1>
        <p className="intro">No stage needs proof right now.</p>
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

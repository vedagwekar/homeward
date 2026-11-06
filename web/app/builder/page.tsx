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
        <small>You'll receive {rupees(stage.amount)} shared with labour after approval.</small>
      </section>
      {stage.proofSent ? (
        <p className="note">Proof sent. Waiting for the engineer.</p>
      ) : (
        <button
          className="button"
          type="button"
          disabled={busy}
          onClick={() => act({ loading: "Sending proof", done: "Proof sent" }, () => updateStage(project.id, stage.slug, { proofSent: true, engineerDecision: null }))}
        >
          Send sample proof
        </button>
      )}
    </>
  );
}

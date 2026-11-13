"use client";

import { useState } from "react";
import { act, activeStage, updateStage, useProjects, useStatus } from "@/lib/store";

// Rivan owns this screen.
export default function Engineer() {
  const active = activeStage(useProjects());
  const [passed, setPassed] = useState<string[]>([]);
  const busy = useStatus().state === "loading";
  if (!active || active.stage.status !== "submitted") {
    return (
      <>
        <h1>Engineer</h1>
        <p className="intro">No proof is waiting for review.</p>
      </>
    );
  }
  const { project, stage } = active;
  const second = stage.amma === "recheck";
  const name = second ? project.engineer.secondName : project.engineer.name;
  const done = second ? stage.secondDecision : stage.engineerDecision;
  if (done) {
    return (
      <>
        <h1>Review sent</h1>
        <p className="intro">{name} has {done} this stage.</p>
      </>
    );
  }
  const decide = (decision: "approved" | "rejected") => {
    act({ loading: decision === "approved" ? "Approving" : "Rejecting", done: decision === "approved" ? "Stage approved" : "Stage rejected. Money stays locked" }, async () => {
      const receipt = await updateStage(project.id, stage.slug, second ? { secondDecision: decision } : { engineerDecision: decision });
      setPassed([]);
      return receipt;
    });
  };
  return (
    <>
      <h1>{second ? "Second check" : "Review"}: {stage.name}</h1>
      <p className="intro">{project.name}. Stage code {stage.code}.</p>
      <div className="photos">
        {stage.photos.map((p) => (
          <figure key={p.src}>
            <img src={p.src} alt={p.caption} />
            <figcaption>
              {p.caption}
            </figcaption>
          </figure>
        ))}
      </div>
      <h3>Checks</h3>
      <fieldset className="group">
        <legend className="hidden">Checks</legend>
        {stage.checklist.map((c) => (
          <label className="row" key={c.item}>
            <input
              type="checkbox"
              checked={passed.includes(c.item)}
              onChange={(e) => setPassed(e.target.checked ? [...passed, c.item] : passed.filter((p) => p !== c.item))}
            />
            <span className="grow">{c.item}</span>
          </label>
        ))}
      </fieldset>
      <button className="button" type="button" disabled={busy || passed.length < stage.checklist.length} onClick={() => decide("approved")}>
        Approve
      </button>
      <button className="button danger" type="button" disabled={busy} onClick={() => decide("rejected")}>
        Reject
      </button>
      <p className="note">Your fee is the same either way.</p>
    </>
  );
}

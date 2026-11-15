"use client";

import { useState } from "react";
import { act, activeStage, updateStage, useProjects, useStatus } from "@/lib/store";

// The engineer's one screen: one check at a time. Look at the proof, tick what you confirmed, then decide.
export default function Engineer() {
  const active = activeStage(useProjects());
  const [passed, setPassed] = useState<string[]>([]);
  const busy = useStatus().state === "loading";

  if (!active || active.stage.status !== "submitted") {
    return (
      <>
        <h1>No checks waiting</h1>
        <p className="task">
          {active
            ? `Next will be ${active.stage.name.toLowerCase()} at ${active.project.name}, once the builder sends a video.`
            : "You will see a check here when a builder sends a video."}
        </p>
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
        <h1>Decision sent</h1>
        <p className="task">
          {name} {done} {stage.name.toLowerCase()}.{" "}
          {done === "rejected" ? "The money stays locked until the builder fixes the work and sends new proof." : `${project.parent} is asked to confirm before anyone is paid.`}
        </p>
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
  const left = stage.checklist.length - passed.length;
  return (
    <>
      <h1>
        {second ? "Second check" : "Check"}: {stage.name.toLowerCase()}
      </h1>
      <p className="intro">
        {project.name}, {project.place}
      </p>
      <p className="task">
        {second
          ? `${project.parent} asked for a second engineer. You are checking as ${name}. ${project.engineer.name} has already approved.`
          : `You are checking as ${name}.`}{" "}
        Nothing is paid until you decide.
      </p>

      <h3>1. Look at the builder's proof</h3>
      <p className="note">The video must show code {stage.code}.</p>
      <div className="photos">
        {stage.photos.map((p) => (
          <figure key={p.src}>
            <img src={p.src} alt={p.caption} />
            <figcaption>{p.caption}</figcaption>
          </figure>
        ))}
      </div>

      <h3>2. Tick what you confirmed on site</h3>
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

      <h3>3. Decide</h3>
      <button className="button" type="button" disabled={busy || left > 0} onClick={() => decide("approved")}>
        Approve
      </button>
      {left > 0 && <p className="hint">Tick {left === 1 ? "the last check" : `${left} more checks`} to approve.</p>}
      <button className="button danger" type="button" disabled={busy} onClick={() => decide("rejected")}>
        Reject. The money stays locked
      </button>
      <p className="hint">Your fee is the same whichever you choose.</p>
    </>
  );
}

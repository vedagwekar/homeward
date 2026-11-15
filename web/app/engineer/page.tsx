"use client";

import { useState } from "react";
import { act, activeStage, confirmDefault, updateStage, useProjects, useStatus } from "@/lib/store";

// The engineer's one screen: one check at a time. Look at the proof, tick what you confirmed, then decide.
export default function Engineer() {
  const projects = useProjects();
  const active = activeStage(projects);
  const [passed, setPassed] = useState<string[]>([]);
  const busy = useStatus().state === "loading";

  // A family's report that the builder has stopped, waiting for an engineer on that stage to confirm it.
  const reported = projects.find((p) => p.security?.claim && !p.security.claim.confirmed);
  const report = reported && (
    <section className="group pad">
      <strong>Family says the builder stopped</strong>
      <p className="now">On {reported.stages.find((s) => s.slug === reported.security!.claim!.stage)?.name.toLowerCase()}. Confirming starts the builder's reply time.</p>
      <button className="button danger" type="button" disabled={busy} onClick={() => act({ loading: "Confirming", done: "Confirmed. Builder can reply" }, () => confirmDefault(reported.id))}>
        Confirm
      </button>
    </section>
  );

  if (!active || active.stage.status !== "submitted") {
    return (
      <>
        {report}
        <h1>No checks waiting</h1>
        <p className="task">{active ? `Next: ${active.stage.name.toLowerCase()}, once the builder sends a video.` : "A check shows here when a builder sends a video."}</p>
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
        {report}
        <h1>Decision sent</h1>
        <p className="task">
          {name} {done} it. {done === "rejected" ? "Money stays locked." : `${project.parent} confirms next.`}
        </p>
      </>
    );
  }

  const decide = (decision: "approved" | "rejected") => {
    act({ loading: decision === "approved" ? "Approving" : "Rejecting", done: decision === "approved" ? "Approved" : "Rejected. Money stays locked" }, async () => {
      const receipt = await updateStage(project.id, stage.slug, second ? { secondDecision: decision } : { engineerDecision: decision });
      setPassed([]);
      return receipt;
    });
  };
  const left = stage.checklist.length - passed.length;
  return (
    <>
      {report}
      <h1>
        {second ? "Second check" : "Check"}: {stage.name.toLowerCase()}
      </h1>
      <p className="intro">{project.name}</p>

      <h3>1. Look at the proof</h3>
      <p className="hint">Code {stage.code} must show.</p>
      <div className="photos">
        {stage.photos.map((p) => (
          <figure key={p.src}>
            <img src={p.src} alt={p.caption} />
            <figcaption>{p.caption}</figcaption>
          </figure>
        ))}
      </div>

      <h3>2. Tick what you saw</h3>
      <fieldset className="group">
        <legend className="hidden">Checks</legend>
        {stage.checklist.map((c) => (
          <label className="row" key={c.item}>
            <input type="checkbox" checked={passed.includes(c.item)} onChange={(e) => setPassed(e.target.checked ? [...passed, c.item] : passed.filter((p) => p !== c.item))} />
            <span className="grow">{c.item}</span>
          </label>
        ))}
      </fieldset>

      <h3>3. Decide</h3>
      <button className="button" type="button" disabled={busy || left > 0} onClick={() => decide("approved")}>
        Approve
      </button>
      {left > 0 && <p className="hint">Tick {left} more to approve.</p>}
      <button className="button danger" type="button" disabled={busy} onClick={() => decide("rejected")}>
        Reject. Money stays locked
      </button>
      <p className="hint">Same fee either way.</p>
    </>
  );
}

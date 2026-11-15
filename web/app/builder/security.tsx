"use client";

import { canReturnDeposit, claimStatus, duration, rupees } from "@/lib/project.mjs";
import { act, contestDefault, type Project, returnDeposit, useNow, useStatus } from "@/lib/store";

/** The builder's own money with the contract: what is held, when it comes back, and any report about them. */
export default function BuilderSecurity({ project }: { project: Project }) {
  const sec = project.security;
  const busy = useStatus().state === "loading";
  const now = useNow();
  if (!sec || sec.depositTarget === 0) return null;

  const held = sec.deposit + sec.retention;
  const claim = claimStatus(sec, now);
  const stage = project.stages.find((s) => s.slug === sec.claim?.stage)?.name ?? "this stage";
  const releaseAt = sec.completedAt ? sec.completedAt + sec.defectsSecs : undefined;
  const ready = now > 0 && canReturnDeposit(project, now);

  return (
    <>
      <h3>Your deposit</h3>
      {sec.defaulted ? (
        <p className="note">Build ended. Your deposit went to the family.</p>
      ) : sec.returned ? (
        <p className="note">Returned to you.</p>
      ) : (
        <>
          <section className="group">
            <div className="row">
              <div className="grow">Deposit</div>
              <span className="muted nowrap">
                {rupees(sec.deposit)} of {rupees(sec.depositTarget)}
              </span>
            </div>
            <div className="row">
              <div className="grow">Held back ({sec.retentionPct}%)</div>
              <span className="muted nowrap">{rupees(sec.retention)}</span>
            </div>
          </section>
          <p className="note">Yours again {duration(sec.defectsSecs)} after handover.</p>
          {ready && (
            <button className="button" type="button" disabled={busy} onClick={() => act({ loading: "Returning your money", done: `${rupees(held)} returned` }, () => returnDeposit(project.id))}>
              Get {rupees(held)} back
            </button>
          )}
          {!ready && releaseAt && now > 0 && now < releaseAt && !sec.claim && <p className="hint">Ready in {duration(releaseAt - now)}.</p>}
        </>
      )}

      {claim.phase === "needs-engineer" && <p className="note">Family reported a problem on {stage}. Waiting for an engineer.</p>}
      {claim.phase === "waiting" && (
        <>
          <section className="group pad">
            <strong>Family says work stopped on {stage}</strong>
            <p className="now">Reply in {duration(claim.secsLeft ?? 0)}. {sec.claim?.stalled ? "Send proof, or dispute." : "Dispute if it's wrong."}</p>
          </section>
          <button className="button quiet" type="button" disabled={busy} onClick={() => act({ loading: "Sending", done: "Disputed. Homeward decides" }, () => contestDefault(project.id))}>
            Dispute
          </button>
        </>
      )}
      {claim.phase === "contested" && <p className="note">Disputed. Homeward decides.</p>}
      {claim.phase === "ready" && <p className="note">Reply time is over.</p>}
    </>
  );
}

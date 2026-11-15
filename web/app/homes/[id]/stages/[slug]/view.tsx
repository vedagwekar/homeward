"use client";

import { notFound } from "next/navigation";
import { homewardFee, isActive, shortDate } from "@/lib/project.mjs";
import { CONTRACT_URL, useProjects, useMoney } from "@/lib/store";
import GateTrack from "../../../../gate-track";
import { Back, statusView, Tile } from "../../../../icons";

export default function View({ id, slug }: { id: string; slug: string }) {
  const money = useMoney();
  const project = useProjects().find((p) => p.id === id);
  const stage = project?.stages.find((s) => s.slug === slug);
  if (!project || !stage) notFound();
  const view = statusView[stage.status as keyof typeof statusView];
  const paid = stage.status === "paid";
  const reviewed = paid || stage.status === "submitted" || stage.status === "rejected";

  return (
    <>
      <Back href={`/homes/${project.id}`} label={project.name} />
      <h1>{stage.name}</h1>
      <p className="intro">
        {view.label}. {money(stage.amount)}.
      </p>

      <section className="group">
        <div className="pad">
          <GateTrack project={project} stage={stage} />
        </div>
        {stage.prePour && (
          <div className="row">
            <div className="grow">Steel is checked before concrete is poured</div>
          </div>
        )}
        {stage.paidOn && (
          <div className="row">
            <div className="grow">Paid on</div>
            <span className="muted">{shortDate(stage.paidOn)}</span>
          </div>
        )}
      </section>

      {stage.photos.length > 0 && reviewed && (
        <>
          <h3>Proof of the work</h3>
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
        </>
      )}

      {stage.checklist.length > 0 && reviewed && (
        <>
          <h3>Engineer's checks</h3>
          <section className="group">
            {stage.checklist.map((c) => (
              <div className="row" key={c.item}>
                <Tile name={paid || c.result === "Pass" ? "check" : "clock"} tone={paid || c.result === "Pass" ? "green" : "gray"} />
                <div className="grow">{c.item}</div>
                <span className="muted">{paid || c.result === "Pass" ? "Pass" : "Waiting"}</span>
              </div>
            ))}
            <div className="row">
              <div className="grow">
                <span>{project.engineer.name}</span>
                <small>{project.engineer.licence}. Paid the same whether they approve or reject.</small>
              </div>
            </div>
          </section>
        </>
      )}

      {paid && stage.payouts.length > 0 && (
        <>
          <h3>Where the money went</h3>
          <section className="group">
            {stage.payouts.map((p) => (
              <div className="row" key={p.to}>
                <div className="grow">{p.to}</div>
                <span className="muted">{money(p.amount)}</span>
              </div>
            ))}
            <div className="row">
              <div className="grow">Homeward fee, 1.5%</div>
              <span className="muted">{money(homewardFee(stage.amount))}</span>
            </div>
          </section>
          <details className="group disclosure">
            <summary>Certificate and technical proof</summary>
            <p>
              This certificate links the stage, the approvals and the payment.{" "}
              <a className="link" href={CONTRACT_URL} target="_blank" rel="noreferrer">
                See the contract on Stellar testnet
              </a>
            </p>
          </details>
        </>
      )}

      {isActive(stage) && (
        <>
          {stage.status === "open" && <p className="note">Builder is working. Code {stage.code}.</p>}
          {stage.status === "submitted" && !stage.engineerDecision && (
            <p className="note">{project.engineer.name} is checking.</p>
          )}
          {stage.status === "rejected" && <p className="note">Sent back. Money stays locked.</p>}
          {stage.status === "submitted" && stage.engineerDecision === "approved" && !stage.amma && <p className="note">Engineer approved. Waiting for {project.parent}.</p>}
          {stage.status === "submitted" && stage.amma === "recheck" && !stage.secondDecision && (
            <p className="note">Second check: {project.engineer.secondName} must approve.</p>
          )}
                  </>
      )}

      {stage.status === "locked" && <p className="note">Proof shows here once the stage starts.</p>}
    </>
  );
}

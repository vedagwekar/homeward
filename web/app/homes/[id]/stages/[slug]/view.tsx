"use client";

import { notFound } from "next/navigation";
import { homewardFee, rupees, shortDate } from "@/lib/project.mjs";
import { useProjects } from "@/lib/store";
import { Back, statusView, Tile } from "../../../../icons";

export default function View({ id, slug }: { id: string; slug: string }) {
  const project = useProjects().find((p) => p.id === id);
  const stage = project?.stages.find((s) => s.slug === slug);
  if (!project || !stage) notFound();
  const view = statusView[stage.status as keyof typeof statusView];
  const paid = stage.status === "paid";
  const reviewed = stage.proofSent || paid;

  return (
    <>
      <Back href={`/homes/${project.id}`} label={project.name} />
      <h1>{stage.name}</h1>

      <section className="group">
        <div className="row">
          <Tile name={view.icon} tone={view.tone} />
          <div className="grow">{view.label}</div>
          <span className="muted">{rupees(stage.amount)}</span>
        </div>
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
                  <small>Sample image</small>
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
                <span className="muted">{rupees(p.amount)}</span>
              </div>
            ))}
            <div className="row">
              <div className="grow">Homeward fee, 1.5%</div>
              <span className="muted">{rupees(homewardFee(stage.amount))}</span>
            </div>
          </section>
          <details className="group disclosure">
            <summary>Certificate and technical proof</summary>
            <p>
              This certificate links the stage, the approvals and the payment. <a href="#">View on Stellar Expert</a>
            </p>
          </details>
        </>
      )}

      {stage.status === "waiting" && (
        <>
          {!stage.proofSent && <p className="note">Waiting for the builder to send proof. The stage code is {stage.code}.</p>}
          {stage.proofSent && stage.engineerDecision !== "approved" && stage.engineerDecision !== "rejected" && (
            <p className="note">Waiting for {project.engineer.name} to check the work.</p>
          )}
          {stage.engineerDecision === "rejected" && <p className="note">The engineer rejected this proof. The money stays locked until it's fixed.</p>}
          {stage.engineerDecision === "approved" && !stage.amma && <p className="note">The engineer approved this stage. Waiting for {project.parent}.</p>}
          {stage.amma === "recheck" && !stage.secondDecision && (
            <p className="note">Second check requested. {project.engineer.secondName} must approve before any money moves.</p>
          )}
          {stage.secondDecision === "rejected" && <p className="note">The second engineer rejected this stage. The money stays locked.</p>}
        </>
      )}

      {stage.status === "locked" && <p className="note">Proof appears here after this stage opens.</p>}
    </>
  );
}

"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { nextStage, rupees, shortDate, totalFunded } from "@/lib/project.mjs";
import { useProjects } from "@/lib/store";
import BudgetBar from "../../budget-bar";
import { Back, Glyph, statusView, Tile } from "../../icons";

export default function View({ id }: { id: string }) {
  const project = useProjects().find((p) => p.id === id);
  if (!project) notFound();
  const next = nextStage(project);
  const family = [...project.sponsors.map((s) => s.name), project.parent];

  return (
    <>
      <Back href="/" label="Homes" />
      <h1>{project.name}</h1>
      <p className="intro">{project.place}</p>

      <section className="group">
        <div className="pad">
          <div className="split">
            <strong>Budget</strong>
            <span className="muted">
              {rupees(totalFunded(project))} of {rupees(project.budget)} funded
            </span>
          </div>
          <BudgetBar project={project} />
        </div>
        {next && next.stillNeeded > 0 && (
          <div className="row">
            <Tile name="plus" tone="green" />
            <div className="grow">
              <strong>Fund {next.stage.name.toLowerCase()}</strong>
              <small>Add {rupees(next.stillNeeded)} to open the next stage.</small>
            </div>
            <Link className="pill" href={`/homes/${project.id}/fund`}>
              Fund
            </Link>
          </div>
        )}
      </section>

      <h3>Stages</h3>
      <section className="group">
        {project.stages.map((stage) => {
          const view = statusView[stage.status as keyof typeof statusView];
          return (
            <Link className="row" key={stage.slug} href={`/homes/${project.id}/stages/${stage.slug}`}>
              <Tile name={view.icon} tone={view.tone} />
              <div className="grow">
                <span>{stage.name}</span>
                <small>{view.label}</small>
              </div>
              <span className="muted nowrap">{rupees(stage.amount)}</span>
              <span className="chevron">
                <Glyph name="chevron" />
              </span>
            </Link>
          );
        })}
      </section>

      {project.stages.some((s) => s.status === "paid") && (
        <>
          <h3>Certificates</h3>
          <section className="group">
            {project.stages
              .filter((s) => s.status === "paid")
              .map((s) => (
                <div className="row" key={s.slug}>
                  <Tile name="shield" tone="green" />
                  <div className="grow">
                    <span>{s.name}</span>
                    <small>Approved and paid {s.paidOn ? shortDate(s.paidOn) : ""}</small>
                  </div>
                  {/* Real transaction link once the contract is live. */}
                  <a className="link" href="#">
                    Stellar Expert
                  </a>
                </div>
              ))}
          </section>
        </>
      )}

      <h3>Family</h3>
      <section className="group">
        <div className="row">
          <span className="avatars" aria-hidden="true">
            {family.map((name) => (
              <span className="avatar" key={name}>
                {name[0]}
              </span>
            ))}
          </span>
          <div className="grow">{family.join(", ")}</div>
        </div>
        {project.sponsors.map((s) => (
          <div className="row" key={s.name}>
            <div className="grow">
              <span>{s.name}</span>
              <small>{s.city}</small>
            </div>
            <span className="muted nowrap">{rupees(s.paidIn)}</span>
          </div>
        ))}
      </section>

      <section className="group spaced">
        <Link className="row" href="/help">
          <Tile name="help" tone="gray" />
          <div className="grow">If something goes wrong</div>
          <span className="chevron">
            <Glyph name="chevron" />
          </span>
        </Link>
      </section>
    </>
  );
}

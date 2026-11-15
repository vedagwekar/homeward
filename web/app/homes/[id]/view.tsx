"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { budgetParts, isActive, nextStage, shortDate } from "@/lib/project.mjs";
import { useProjects, useMoney, useSession } from "@/lib/store";
import BudgetBar from "../../budget-bar";
import GateTrack from "../../gate-track";
import House3D, { hasModel } from "../../house-3d";
import { Back, Glyph, statusView, Tile } from "../../icons";

export default function View({ id }: { id: string }) {
  const money = useMoney();
  const project = useProjects().find((p) => p.id === id);
  if (!project) notFound();
  const next = nextStage(project);
  const parts = budgetParts(project);
  const session = useSession();
  // Everything that isn't the house, the money or the stages.
  const more = [
    { href: `/homes/${project.id}/team`, label: "Builder and engineer", detail: "Who is on the job" },
    { href: `/homes/${project.id}/camera`, label: "Site camera", detail: "Watch live" },
    { href: `/homes/${project.id}/builder-problem`, label: "If the builder stops working", detail: "Report it, get your money back" },
    { href: `/homes/${project.id}/money-back`, label: "Money back", detail: "Get unspent money back" },
    { href: "/help", label: "If something goes wrong", detail: "Step by step" },
  ];
  const current = project.frozen ? undefined : project.stages.find(isActive) ?? project.stages.find((s) => s.status === "locked");

  return (
    <>
      {session?.role !== "parent" && <Back href="/" label="Homes" />}
      <h1>{project.name}</h1>
      <p className="intro">{project.place}</p>
      {project.security?.defaulted ? (
        <p className="note">Builder stopped. Your money came back.</p>
      ) : (
        project.frozen && <p className="note">Stopped. Unspent money returned.</p>
      )}

      <section className="group hero">
        {hasModel(project.id) && <House3D project={project} />}
        <span className="muted">Locked in the Homeward contract</span>
        <p className="hero-figure">{money(parts.waiting + parts.ready)}</p>
        <BudgetBar project={project} />
        {next && next.stillNeeded > 0 && (
          <Link className="button" href={`/homes/${project.id}/fund`}>
            Fund {next.stage.name.toLowerCase()}, {money(next.stillNeeded)}
          </Link>
        )}
        <p className="held">Held by a Stellar smart contract.</p>
        {project.security && project.security.depositTarget > 0 && !project.security.defaulted && !project.security.returned && (
          <p className="held">Builder's own money held: {money(project.security.deposit + project.security.retention)}</p>
        )}
      </section>

      {current && isActive(current) && (
        <>
          <h3>Now: {current.name}</h3>
          <section className="group">
            <div className="pad">
              <GateTrack project={project} stage={current} />
            </div>
          </section>
        </>
      )}

      <h3>Stages</h3>
      <section className="group">
        {project.stages.map((stage) => {
          const view = statusView[stage.status as keyof typeof statusView];
          return (
            <Link className="row" key={stage.slug} href={`/homes/${project.id}/stages/${stage.slug}`}>
              <Tile name={view.icon} tone={view.tone} />
              <div className="grow">
                <span>{stage.name}</span>
                <small>{stage.status === "paid" ? `Paid${stage.paidOn ? ` ${shortDate(stage.paidOn)}` : ""}` : view.label}</small>
              </div>
              <span className="muted nowrap">{money(stage.amount)}</span>
              <span className="chevron">
                <Glyph name="chevron" />
              </span>
            </Link>
          );
        })}
      </section>

      <details className="more">
        <summary>Family, team and money back</summary>
        <section className="group">
          {project.sponsors.map((s) => (
            <div className="row" key={s.name}>
              <div className="grow">
                <span>{s.name}</span>
                <small>Paid in from {s.city}</small>
              </div>
              <span className="muted nowrap">{money(s.paidIn)}</span>
            </div>
          ))}
          {more.map((l) => (
            <Link className="row" href={l.href} key={l.href}>
              <div className="grow">
                <span>{l.label}</span>
                <small>{l.detail}</small>
              </div>
              <span className="chevron">
                <Glyph name="chevron" />
              </span>
            </Link>
          ))}
        </section>
      </details>
    </>
  );
}

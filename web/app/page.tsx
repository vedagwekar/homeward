"use client";

import Link from "next/link";
import { nextStage, rupees, shortDate, timeline, totalFunded } from "@/lib/project.mjs";
import { useProjects } from "@/lib/store";
import BudgetBar from "./budget-bar";
import { Glyph, Tile } from "./icons";

export default function Homes() {
  const projects = useProjects();
  const due = timeline(projects).slice(0, 3);

  return (
    <>
      <h1>Homes</h1>
      <p className="intro">Pay for your parents' house one stage at a time. Each payment is released only after an engineer checks the work.</p>

      <section className="group">
        {projects.map((p) => (
          <Link className="row" href={`/homes/${p.id}`} key={p.id}>
            <Tile name="home" tone="blue" />
            <div className="grow">
              <span>{p.name}</span>
              <small>{p.place}</small>
              <BudgetBar project={p} legend={false} />
              <small>
                {rupees(totalFunded(p))} of {rupees(p.budget)} funded
              </small>
            </div>
            <span className="chevron">
              <Glyph name="chevron" />
            </span>
          </Link>
        ))}
      </section>

      <h3>Needs you</h3>
      <section className="group">
        {projects.map((p) => {
          const next = nextStage(p);
          if (!next || next.stillNeeded === 0) return null;
          return (
            <div className="row" key={p.id}>
              <Tile name="plus" tone="green" />
              <div className="grow">
                <strong>Fund {next.stage.name.toLowerCase()}</strong>
                <small>
                  {p.name}. Add {rupees(next.stillNeeded)}.
                </small>
              </div>
              <Link className="pill" href={`/homes/${p.id}/fund`}>
                Fund
              </Link>
            </div>
          );
        })}
      </section>

      <div className="heading-row">
        <h3>Coming up</h3>
        <Link href="/timeline">See all</Link>
      </div>
      <section className="group">
        {due.map((d) => (
          <Link className="row" href={`/homes/${d.projectId}/stages/${d.slug}`} key={d.date + d.title}>
            <span className="date">
              <span className={`dot ${d.track === "pay" ? "green" : "orange"}`} />
              {shortDate(d.date)}
            </span>
            <div className="grow">
              <span>{d.title}</span>
              <small>{d.project}</small>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}

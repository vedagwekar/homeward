"use client";

import Link from "next/link";
import { nextStage, totalFunded } from "@/lib/project.mjs";
import { useProjects, useMoney } from "@/lib/store";
import BudgetBar from "./budget-bar";
import CurrencySwitch from "./currency-switch";
import { Glyph, Tile } from "./icons";

export default function Homes() {
  const money = useMoney();
  const projects = useProjects();

  return (
    <>
      <h1>Homes</h1>
      <p className="intro">Pay for your parents' house one stage at a time. Each payment is released only after an engineer checks the work.</p>
      <CurrencySwitch />

      <section className="group">
        {projects.map((p) => (
          <Link className="row" href={`/homes/${p.id}`} key={p.id}>
            <Tile name="home" tone="blue" />
            <div className="grow">
              <span>{p.name}</span>
              <small>{p.place}</small>
              <BudgetBar project={p} legend={false} />
              <small>
                {money(totalFunded(p))} of {money(p.budget)} funded
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
                  {p.name}. Add {money(next.stillNeeded)}.
                </small>
              </div>
              <Link className="pill" href={`/homes/${p.id}/fund`}>
                Fund
              </Link>
            </div>
          );
        })}
      </section>

    </>
  );
}

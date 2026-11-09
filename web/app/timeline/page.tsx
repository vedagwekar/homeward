"use client";

import Link from "next/link";
import { useState } from "react";
import { shortDate, timeline } from "@/lib/project.mjs";
import { useProjects, useMoney } from "@/lib/store";

const tabs = [
  ["all", "All"],
  ["pay", "You pay"],
  ["site", "On site"],
] as const;

export default function Timeline() {
  const money = useMoney();
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("all");
  const items = timeline(useProjects()).filter((i) => tab === "all" || i.track === tab);

  return (
    <>
      <h1>Timeline</h1>
      <div className="segments" role="group" aria-label="Filter timeline">
        {tabs.map(([key, label]) => (
          <button key={key} type="button" aria-pressed={tab === key} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      <section className="group">
        {items.map((d) => (
          <Link className="row" href={`/homes/${d.projectId}/stages/${d.slug}`} key={d.date + d.title}>
            <span className="date">
              <span className={`dot ${d.track === "pay" ? "green" : "orange"}`} />
              {shortDate(d.date)}
            </span>
            <div className="grow">
              <span>{d.title}</span>
              <small>{d.project}</small>
            </div>
            {d.amount && <span className="muted nowrap">{money(d.amount)}</span>}
          </Link>
        ))}
      </section>
    </>
  );
}

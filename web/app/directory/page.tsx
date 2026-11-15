"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEMO_STEPS, stageOwner } from "@/lib/demo.mjs";
import { rupees } from "@/lib/project.mjs";
import { type Session, signIn, useProjects } from "@/lib/store";
import { Wordmark } from "../logo";

// The map of the app: who each person is, what they do, and who every stage is waiting on right now.
const HOME: Record<Session["role"], string> = { sponsor: "/", parent: "/parents", builder: "/builder", engineer: "/engineer" };
const ROLES: { role: Session["role"]; title: string; job: string; does: string[] }[] = [
  { role: "sponsor", title: "Family abroad", job: "Pays for the build.", does: ["Locks the money for each stage", "Watches the money and the site", "Can stop the build and get unspent money back"] },
  { role: "parent", title: "Parent at home", job: "Lives in the house and has the last word.", does: ["Says Yes, or Check again", "Sees every stage in Malayalam, Punjabi or English", "Watches the site camera"] },
  { role: "builder", title: "Builder", job: "Does the work and proves it.", does: ["Puts in a refundable deposit", "Starts a stage and films today's code", "Gets paid when the checks pass"] },
  { role: "engineer", title: "Independent engineer", job: "Checks the work. Paid the same either way.", does: ["Looks at the video and ticks the checks", "Approves or says no", "A second engineer checks again if the parent asks"] },
];

export default function Directory() {
  const router = useRouter();
  const projects = useProjects();
  const [which, setWhich] = useState(0);
  const project = projects[which] ?? projects[0];
  const who = (role: Session["role"]): Session => ({
    sponsor: { role, name: project.sponsors[0].name },
    parent: { role, name: project.parent },
    builder: { role, name: project.builder.name },
    engineer: { role, name: project.engineer.name },
  })[role];
  const enter = (role: Session["role"]) => {
    signIn(who(role));
    router.push(HOME[role]);
  };
  const title = Object.fromEntries(ROLES.map((r) => [r.role, r.title])) as Record<string, string>;

  return (
    <div className="tour wide">
      <Wordmark size={32} />
      <h1>Who does what</h1>
      <p className="intro">Four people, one stage at a time.</p>

      <div className="segments" role="group" aria-label="Home">
        {projects.map((p, i) => (
          <button key={p.id} type="button" aria-pressed={which === i} onClick={() => setWhich(i)}>
            {p.name}
          </button>
        ))}
      </div>

      <h3>Waiting on, right now</h3>
      <section className="group">
        {project.stages.map((s) => {
          const o = stageOwner(project, s);
          return (
            <div className="row owner-row" key={s.slug} data-who={o.who ?? "none"}>
              <div className="grow">
                <strong>{s.name}</strong>
                <small>{rupees(s.amount)} · {o.text}</small>
              </div>
              {o.who ? (
                <button className="chip-button" type="button" onClick={() => enter(o.who as Session["role"])}>
                  {title[o.who]} →
                </button>
              ) : (
                <span className="muted">{o.text === "Paid" ? "✓" : ""}</span>
              )}
            </div>
          );
        })}
      </section>

      <h3>The people</h3>
      {ROLES.map((r) => (
        <section className="group pad role-card" key={r.role} data-who={r.role}>
          <div className="role-head">
            <span className="avatar large">{who(r.role).name[0]}</span>
            <div className="grow">
              <strong>{r.title}</strong>
              <small>{who(r.role).name}. {r.job}</small>
            </div>
          </div>
          <ul className="tight">
            {r.does.map((d) => <li key={d}>{d}</li>)}
          </ul>
          <button className="button quiet" type="button" onClick={() => enter(r.role)}>
            Open as {who(r.role).name}
          </button>
        </section>
      ))}

      <h3>One stage, in order</h3>
      <ol className="tour-list">
        {DEMO_STEPS.map((id) => (
          <li key={id} data-state="todo">
            <span className="tour-dot" aria-hidden="true">{DEMO_STEPS.indexOf(id) + 1}</span>
            <span>{STEP_LABEL[id]}</span>
          </li>
        ))}
      </ol>

      <p className="note">
        <Link className="link" href="/demo">Take the guided tour</Link>{" · "}
        <Link className="link" href="/signin">Sign in</Link>{" · "}
        <Link className="link" href="/proof">Stellar record</Link>
      </p>
    </div>
  );
}

const STEP_LABEL: Record<string, string> = {
  fund: "Family: locks the money",
  deposit: "Builder: puts in the deposit",
  start: "Builder: starts the stage",
  proof: "Builder: films today's code",
  engineer: "Engineer: checks the work",
  parent: "Parent: says Yes, or Check again",
  second: "Second engineer: checks again",
  locked: "If the second check fails, the money stays locked",
};

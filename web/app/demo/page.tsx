"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_STEPS, demoStep } from "@/lib/demo.mjs";
import { LIVE, resetDemo, setHomeFocus, type Session, signIn, useProjects, useStatus } from "@/lib/store";
import { Wordmark } from "../logo";

// A guided tour for anyone at the table: it shows where the story is, and who to be next.
const labels: Record<string, string> = {
  fund: "The family locks the money",
  deposit: "The builder puts in the deposit",
  start: "The builder starts the stage",
  proof: "The builder films today's code",
  engineer: "The engineer checks the work",
  parent: "The parent asks for a second check",
  second: "A second engineer says no",
  locked: "The money stays locked",
};

export default function Tour() {
  const router = useRouter();
  const projects = useProjects();
  const [which, setWhich] = useState(0);
  const busy = useStatus().state === "loading";
  // The first time someone opens the tour on the mock app, begin at the beginning, not part-way through.
  useEffect(() => {
    if (LIVE) return;
    try {
      if (!sessionStorage.getItem("homeward-tour-started")) {
        sessionStorage.setItem("homeward-tour-started", "1");
        resetDemo("fresh");
      }
    } catch {}
  }, []);
  const project = projects[which] ?? projects[0];
  const step = demoStep(project);
  const at = DEMO_STEPS.indexOf(step.id);

  const who: Record<string, Session> = {
    sponsor: { role: "sponsor", name: project.sponsors[0].name },
    builder: { role: "builder", name: project.builder.name },
    engineer: { role: "engineer", name: project.engineer.name },
    parent: { role: "parent", name: project.parent },
  };
  const person = who[step.who];
  const go = () => {
    signIn(person);
    setHomeFocus(project.id);
    router.push(step.href);
  };

  const roleLabel: Record<string, string> = { sponsor: "Family abroad", builder: "Builder", engineer: "Independent engineer", parent: "Parent at home" };
  return (
    <div className="tour">
      <Wordmark size={32} />
      <h1>Try the story</h1>
      <p className="intro">You play everyone. Each step takes a few seconds.</p>

      <div className="segments" role="group" aria-label="Home">
        {projects.map((p, i) => (
          <button key={p.id} type="button" aria-pressed={which === i} onClick={() => setWhich(i)}>
            {p.name}
          </button>
        ))}
      </div>

      <section className="tour-card" data-who={step.who}>
        <div className="tour-who">
          <span className="avatar large">{person.name[0]}</span>
          <div>
            <small>Next, you are</small>
            <strong>{person.name}</strong>
            <small>{roleLabel[step.who]}</small>
          </div>
        </div>
        <h2>{step.title}</h2>
        <p>{step.detail}</p>
        <button className="button" type="button" onClick={go}>
          Go as {person.name} →
        </button>
      </section>

      <h3>The story</h3>
      <ol className="tour-list">
        {DEMO_STEPS.map((id, i) => (
          <li key={id} aria-current={i === at ? "step" : undefined} data-state={at < 0 ? "todo" : i < at ? "done" : i === at ? "now" : "todo"}>
            <span className="tour-dot" aria-hidden="true">{at >= 0 && i < at ? "✓" : i + 1}</span>
            <span>{labels[id]}</span>
          </li>
        ))}
      </ol>

      <p className="note">
        {LIVE ? "Real transactions on Stellar Testnet." : "Practice mode: nothing leaves this browser."}{" "}
        <Link className="link" href="/directory">Who does what</Link>{" · "}
        <button className="link-button" type="button" disabled={busy} onClick={() => resetDemo("fresh")}>
          Start over from step 1
        </button>
      </p>
    </div>
  );
}

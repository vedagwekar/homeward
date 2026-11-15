"use client";

import { useRouter } from "next/navigation";
import { type Session, signIn, useProjects } from "@/lib/store";
import { Wordmark } from "../logo";

// Where each kind of person lands after signing in.
const HOME: Record<Session["role"], string> = { sponsor: "/", parent: "/parents", builder: "/builder", engineer: "/engineer" };

export default function SignIn() {
  const router = useRouter();
  const projects = useProjects();
  const enter = (role: Session["role"], name: string) => {
    signIn({ role, name });
    router.replace(HOME[role]);
  };
  // Everyone in the demo homes, once each.
  const sponsors = [...new Map(projects.flatMap((p) => p.sponsors).map((s) => [s.name, s])).values()];
  const person = (role: Session["role"], name: string, detail: string) => (
    <button className="person" type="button" key={role + name} onClick={() => enter(role, name)}>
      <span className="avatar large">{name[0]}</span>
      <span className="grow">
        <span>{name}</span>
        <small>{detail}</small>
      </span>
    </button>
  );

  return (
    <div className="signin">
      <Wordmark size={32} />
      <h1>Who is signing in?</h1>
      <p className="intro">Pay for a family home one checked stage at a time.</p>

      <h3>I'm paying for a home</h3>
      <section className="group">{sponsors.map((s) => person("sponsor", s.name, `Sending from ${s.city}`))}</section>

      <h3>The home is mine</h3>
      <section className="group">{projects.map((p) => person("parent", p.parent, `${p.name}, ${p.place}`))}</section>

      <h3>I work on the site</h3>
      <section className="group">
        {person("builder", projects[0].builder.name, "Builder")}
        {person("engineer", projects[0].engineer.name, "Independent engineer")}
      </section>

      <p className="note">
        Demo sign-in with sample people. In the real app a family signs in with a phone number and a one-time code. Nobody needs a wallet, a seed
        phrase or any crypto.
      </p>
    </div>
  );
}

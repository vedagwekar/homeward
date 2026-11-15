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
      <span className="chev" aria-hidden="true">›</span>
    </button>
  );

  return (
    <div className="signin">
      <Wordmark size={32} />
      <h1>Pay for a family home one checked stage at a time.</h1>
      <p className="intro">Live on Stellar Testnet. Nothing here moves real money.</p>

      <button className="tour-link" type="button" onClick={() => router.push("/demo")}>
        <span>
          <strong>Take the guided tour</strong>
          <small>Play every role in seven taps</small>
        </span>
        <span className="go" aria-hidden="true">→</span>
      </button>

      <div className="divider">or pick who you are</div>

      <div className="role-title"><h3>Family abroad</h3><small>pays for the build</small></div>
      <section className="group">{sponsors.map((s) => person("sponsor", s.name, `Sending from ${s.city}`))}</section>

      <div className="role-title"><h3>Parent at home</h3><small>approves each stage</small></div>
      <section className="group">{projects.map((p) => person("parent", p.parent, `${p.name}, ${p.place}`))}</section>

      <div className="role-title"><h3>On the site</h3><small>builds and checks</small></div>
      <section className="group">
        {person("builder", projects[0].builder.name, "Builder")}
        {person("engineer", projects[0].engineer.name, "Independent engineer")}
      </section>

      <p className="note">Demo sign-in. The real app uses a phone number and a one-time code.</p>
    </div>
  );
}

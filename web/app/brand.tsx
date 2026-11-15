"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { setHomeFocus, signIn, useProjects, useSession } from "@/lib/store";
import { Wordmark } from "./logo";

// Pages anyone can open without signing in: the sign-in screen, the guided tour, the transaction record and the price tool.
const open = ["/signin", "/demo", "/proof", "/price", "/directory"];
// These two have their own header.
const bare = ["/signin", "/demo", "/directory"];

/** The bar at the top of every screen. It also sends anyone who isn't signed in to the sign-in screen. */
export default function Brand() {
  const session = useSession();
  const path = usePathname();
  const router = useRouter();
  const projects = useProjects();
  useEffect(() => {
    if (session === null && !open.includes(path)) router.replace("/signin");
  }, [session, path, router]);
  if (bare.includes(path)) return null;
  return (
    <div className="brand">
      <Wordmark />
      <span>
        {session ? session.name : "Testnet demo"}
        {session && (
          <button type="button" onClick={() => signIn(null)}>
            Sign out
          </button>
        )}
      </span>
    </div>
  );
}

/** Demo only: jump between the four roles without signing out. Shown to anyone signed in. */
export function RoleSwitch() {
  const session = useSession();
  const path = usePathname();
  const router = useRouter();
  const projects = useProjects();
  if (!session || bare.includes(path) || !projects[0]) return null;
  const p = projects.find((x) => x.parent === session.name || x.sponsors.some((s) => s.name === session.name)) ?? projects[0];
  const roles = [
    { label: "Family", to: { role: "sponsor", name: p.sponsors[0].name } as const, href: "/" },
    { label: "Parent", to: { role: "parent", name: p.parent } as const, href: "/parents" },
    { label: "Builder", to: { role: "builder", name: p.builder.name } as const, href: "/builder" },
    { label: "Engineer", to: { role: "engineer", name: p.engineer.name } as const, href: "/engineer" },
  ];
  return (
    <div className="role-switch" role="group" aria-label="Demo role">
      <small>Demo role</small>
      {roles.map((r) => (
        <button key={r.label} type="button" aria-pressed={session.role === r.to.role} onClick={() => { signIn(r.to); setHomeFocus(p.id); router.push(r.href); }}>
          {r.label}
        </button>
      ))}
      <button type="button" aria-pressed={path === "/directory"} onClick={() => router.push("/directory")}>
        Guide
      </button>
    </div>
  );
}

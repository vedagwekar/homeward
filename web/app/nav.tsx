"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Glyph, type GlyphName, Tile } from "./icons";
import { resetDemo, type Session, useSession } from "@/lib/store";

type Item = { href: string; label: string; icon: GlyphName };
// A family has two places to go. Everyone else has one screen, so they get no menu at all.
const menus: Record<Session["role"], Item[]> = {
  sponsor: [{ href: "/", label: "Homes", icon: "home" }, { href: "/timeline", label: "Timeline", icon: "calendar" }],
  parent: [],
  builder: [],
  engineer: [],
};
const titles: Record<Session["role"], string> = { sponsor: "Family account", parent: "Home owner", builder: "Builder", engineer: "Engineer" };

export default function Nav() {
  const path = usePathname();
  const session = useSession();
  if (!session || path === "/signin" || menus[session.role].length < 2) return null;
  const active = (href: string) => path === href || (href === "/" && path.startsWith("/homes"));
  return (
    <nav aria-label="Main">
      <div className="account">
        <span className="avatar large">{session.name[0]}</span>
        <span>
          <strong>{session.name}</strong>
          <small>{titles[session.role]}</small>
        </span>
      </div>
      {menus[session.role].map((l) => (
        <Link key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined}>
          <span className="tab-icon">
            <Glyph name={l.icon} />
          </span>
          <span className="side-icon">
            <Tile name={l.icon} tone="gray" />
          </span>
          {l.label}
        </Link>
      ))}
      <button className="reset" type="button" onClick={() => resetDemo("sample")}>
        Reset sample homes
      </button>
    </nav>
  );
}

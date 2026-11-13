"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Glyph, type GlyphName, Tile } from "./icons";
import { resetDemo } from "@/lib/store";

const family: { href: string; label: string; icon: GlyphName; tone: string }[] = [
  { href: "/", label: "Homes", icon: "home", tone: "gray" },
  { href: "/timeline", label: "Timeline", icon: "calendar", tone: "gray" },
];
const others: typeof family = [
  { href: "/builder", label: "Builder", icon: "hammer", tone: "gray" },
  { href: "/engineer", label: "Engineer", icon: "shield", tone: "gray" },
  { href: "/parents", label: "Parents", icon: "person", tone: "gray" },
];

export default function Nav() {
  const path = usePathname();
  const active = (href: string) => path === href || (href === "/" && path.startsWith("/homes"));
  const item = (l: (typeof family)[number]) => (
    <Link key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined}>
      <span className="tab-icon">
        <Glyph name={l.icon} />
      </span>
      <span className="side-icon">
        <Tile name={l.icon} tone={l.tone} />
      </span>
      {l.label}
    </Link>
  );
  return (
    <nav aria-label="Main">
      <div className="account">
        <span className="avatar large">A</span>
        <span>
          <strong>Anil</strong>
          <small>Family account</small>
        </span>
      </div>
      {family.map(item)}
      <p className="nav-label">View the app as</p>
      {others.map(item)}
      <button className="reset" type="button" onClick={resetDemo}>
        Reset demo
      </button>
    </nav>
  );
}

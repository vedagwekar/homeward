const glyphs = {
  home: "M3 11 12 3l9 8v10h-6v-6H9v6H3z",
  calendar: "M4 6h16v15H4zM4 10h16M8 3v5M16 3v5",
  plus: "M12 4v16M4 12h16",
  hammer: "M5 20 15 10M11 6l3-3 7 7-3 3z",
  shield: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6zM8.5 12l2.5 2.5 4.5-5",
  person: "M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM4 21c1-5 4-7 8-7s7 2 8 7",
  check: "M5 13l4.5 4.5L19 7",
  cross: "M6 6l12 12M18 6 6 18",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5.5l3.5 2",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  chevron: "M9 5l7 7-7 7",
  back: "M15 5l-7 7 7 7",
  help: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.8 2.1c-.8.5-1.3 1-1.3 1.9M12 17h.01",
};

export type GlyphName = keyof typeof glyphs;

export function Glyph({ name }: { name: GlyphName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d={glyphs[name]} />
    </svg>
  );
}

export function Tile({ name, tone }: { name: GlyphName; tone: string }) {
  return (
    <span className={`tile ${tone}`}>
      <Glyph name={name} />
    </span>
  );
}

export const statusView = {
  paid: { icon: "check", tone: "green", label: "Paid" },
  waiting: { icon: "clock", tone: "orange", label: "Waiting for checks" },
  locked: { icon: "lock", tone: "gray", label: "Not open yet" },
} as const;

export function Back({ href, label }: { href: string; label: string }) {
  return (
    <a className="back" href={href}>
      <Glyph name="back" />
      {label}
    </a>
  );
}

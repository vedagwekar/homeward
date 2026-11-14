// The Homeward mark: a Kerala roof over two laid courses. Red oxide, like a polished floor.
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M5 30 Q13 29 17 25 L32 8 L47 25 Q51 29 59 30" fill="none" stroke="var(--oxide)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="14" y="36" width="36" height="8" rx="4" fill="var(--oxide)" />
      <rect x="14" y="48" width="36" height="8" rx="4" fill="var(--oxide)" />
    </svg>
  );
}

export function Wordmark({ size }: { size?: number }) {
  return (
    <span className="wordmark">
      <Logo size={size} />
      homeward
    </span>
  );
}

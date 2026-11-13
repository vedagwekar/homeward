"use client";

import { clearStatus, useStatus } from "@/lib/store";

export default function StatusBar() {
  const status = useStatus();
  if (status.state === "idle") return null;
  return (
    <div className={`status ${status.state}`} role="status">
      {status.state === "loading" && <span className="spinner" aria-hidden="true" />}
      <span className="grow">{status.text}</span>
      {status.state === "done" && <a href={status.link} target="_blank" rel="noreferrer">View on Stellar Expert</a>}
      {status.state !== "loading" && (
        <button type="button" onClick={clearStatus} aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
}

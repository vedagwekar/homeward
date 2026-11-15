"use client";

import { useEffect, useState } from "react";
import { rupees } from "@/lib/project.mjs";
import { CONTRACT_URL, FIRST_CONTRACT_URL, LIVE, loadProof, type ProofItem, useProjects } from "@/lib/store";

const CONTRACT_ID = CONTRACT_URL.split("/").pop() ?? "";
const when = (iso: string) => new Date(iso).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
// The backend's records say "Rs 100000"; show money the way the rest of the app does.
const plain = (label: string) => label.replace(/Rs (\d+)/, (_, n) => rupees(Number(n)));

const real = ["The contract and every rule in it", "Test dollars (TUSDC) moving between accounts", "Each approval, rejection and second check", "Certificates for approved stages"];
const simulated = ["Interac and bank transfers", "Rupee payouts to builders and suppliers", "Text messages to parents", "Engineer licences and sign-in"];

export default function Proof() {
  const projects = useProjects();
  const [items, setItems] = useState<ProofItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    loadProof().then(setItems, () => setFailed(true));
  }, []);
  const homeName = (id: string) => projects.find((p) => p.id === id)?.name ?? id;
  // The saved transactions are listed newest first, so the last one is when the run began.
  const ran = items?.length ? new Date(items[items.length - 1].at).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" }) : "";

  return (
    <>
      <h1>Proof on Stellar testnet</h1>
      <p className="intro">Every rule runs in one public contract. Check each step yourself.</p>

      <h3>The contract</h3>
      <section className="group">
        <div className="row">
          <div className="grow">
            <span>Homeward contract</span>
            <span className="hash">{CONTRACT_ID}</span>
          </div>
          <a className="link" href={CONTRACT_URL} target="_blank" rel="noreferrer">
            Open
          </a>
        </div>
        <div className="row">
          <div className="grow">
            <span>First version</span>
            <small>Before the builder's deposit. Still valid.</small>
          </div>
          <a className="link" href={FIRST_CONTRACT_URL} target="_blank" rel="noreferrer">
            Open
          </a>
        </div>
        <div className="row">
          <div className="grow">
            <span>Network</span>
            <small>Stellar testnet. Test money only.</small>
          </div>
        </div>
        <div className="row">
          <div className="grow">
            <span>Who can take money out</span>
            <small>Only the payees fixed when the build was set up. Homeward has no withdraw function.</small>
          </div>
        </div>
      </section>

      <h3>Every transaction</h3>
      {!LIVE && ran && <p className="note">Run on {ran}. Each opens on Stellar Expert.</p>}
      <section className="group">
        {failed && <p className="pad">We couldn't load the records. The contract link above still works.</p>}
        {!items && !failed && <p className="pad muted">Loading the records</p>}
        {items?.length === 0 && <p className="pad">Nothing has been sent yet. Fund a stage and it will appear here.</p>}
        {items?.map((i) => (
          <div className={`row${i.kind === "rejected" ? " refused" : ""}`} key={i.hash}>
            <div className="grow">
              <strong>{plain(i.label)}</strong>
              <small>
                {homeName(i.home)}, {when(i.at)}
              </small>
              <span className="hash">{i.hash.slice(0, 12)}…{i.hash.slice(-6)}</span>
            </div>
            <a className="link" href={i.explorer} target="_blank" rel="noreferrer" aria-label={`View "${plain(i.label)}" on Stellar Expert`}>
              View
            </a>
          </div>
        ))}
      </section>

      <h3>What is real here</h3>
      <section className="group">
        {real.map((r) => (
          <div className="row" key={r}>
            <div className="grow">{r}</div>
            <span className="muted">On testnet</span>
          </div>
        ))}
      </section>
      <h3>What is simulated</h3>
      <section className="group">
        {simulated.map((r) => (
          <div className="row" key={r}>
            <div className="grow">{r}</div>
            <span className="muted">Simulated</span>
          </div>
        ))}
      </section>
    </>
  );
}

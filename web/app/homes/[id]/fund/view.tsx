"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { dollars, homewardFee, nextStage, rupees, totalFunded } from "@/lib/project.mjs";
import { act, addFunding, useProjects, useStatus } from "@/lib/store";
import { Back } from "../../../icons";


export default function View({ id }: { id: string }) {
  const project = useProjects().find((p) => p.id === id);
  const [choice, setChoice] = useState(0);
  const [sponsor, setSponsor] = useState(project?.sponsors[0].name ?? "");
  const [done, setDone] = useState<number | null>(null);
  const busy = useStatus().state === "loading";
  if (!project) notFound();

  const next = nextStage(project);
  const remaining = project.budget - totalFunded(project);
  const options = [
    ...(next && next.stillNeeded > 0 && next.stillNeeded < remaining ? [{ label: next.stage.name, amount: next.stillNeeded }] : []),
    { label: "Rest of the build", amount: remaining },
  ];
  const picked = options[Math.min(choice, options.length - 1)];
  const fee = homewardFee(picked.amount);
  const total = picked.amount + fee;
  const cad = dollars(total, project.rupeesPerCad);

  if (done !== null) {
    return (
      <>
        <h1>Money locked</h1>
        <section className="group">
          <div className="row">
            <div className="grow">From {sponsor}</div>
            <span className="muted">{rupees(done)}</span>
          </div>
          <div className="row">
            <div className="grow">Released when</div>
            <span className="muted">The stage passes its checks</span>
          </div>
        </section>
        <Link className="button" href={`/homes/${project.id}`}>
          Done
        </Link>
      </>
    );
  }

  return (
    <>
      <Back href={`/homes/${project.id}`} label={project.name} />
      <h1>Fund this home</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          act({ loading: `Locking ${rupees(picked.amount)}`, done: `${rupees(picked.amount)} locked` }, () => {
            addFunding(project.id, sponsor, picked.amount);
            setDone(picked.amount);
          });
        }}
      >
        <h3>What are you funding?</h3>
        <fieldset className="group">
          <legend className="hidden">What are you funding?</legend>
          {options.map((o, i) => (
            <label className="row" key={o.label}>
              <input type="radio" name="amount" checked={picked === o} onChange={() => setChoice(i)} />
              <span className="grow">{o.label}</span>
              <span className="muted">{rupees(o.amount)}</span>
            </label>
          ))}
        </fieldset>

        <h3>Who is paying?</h3>
        <section className="group">
          <label className="row">
            <span className="grow">Family member</span>
            <select value={sponsor} onChange={(e) => setSponsor(e.target.value)}>
              {project.sponsors.map((s) => (
                <option key={s.name}>{s.name}</option>
              ))}
            </select>
          </label>
        </section>

        <h3>What it costs</h3>
        <section className="group">
          <div className="row">
            <div className="grow">Locked for the build</div>
            <span className="muted">{rupees(picked.amount)}</span>
          </div>
          <div className="row">
            <div className="grow">
              <span>Homeward fee, 1.5%</span>
              <small>Pays the engineer, whether they approve or reject</small>
            </div>
            <span className="muted">{rupees(fee)}</span>
          </div>
          <div className="row">
            <div className="grow">Exchange rate, demo</div>
            <span className="muted">₹{project.rupeesPerCad} per C$1</span>
          </div>
          <div className="row">
            <strong className="grow">You pay</strong>
            <strong>{cad} CAD</strong>
          </div>
        </section>
        <p className="note">Transfer partner fees aren't included in this demo.</p>

        <button className="button" type="submit" disabled={busy}>
          Pay {cad} with Interac (simulated)
        </button>
        {/* Youdis connects the SEP-24 deposit here on Mon Nov 9. */}
        <button className="button quiet" type="button" disabled>
          Deposit via anchor (coming soon)
        </button>
      </form>
    </>
  );
}

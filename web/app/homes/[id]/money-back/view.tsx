"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { budgetParts, refundSplit, totalFunded, totalPaid } from "@/lib/project.mjs";
import { act, returnMoney, useProjects, useStatus, useMoney } from "@/lib/store";
import { Back } from "../../../icons";

export default function View({ id }: { id: string }) {
  const money = useMoney();
  const project = useProjects().find((p) => p.id === id);
  const busy = useStatus().state === "loading";
  const [stop, setStop] = useState(false);
  // Kept after returning, because the totals change once the money has gone back.
  const [done, setDone] = useState<{ name: string; amount: number }[] | null>(null);
  if (!project) notFound();

  const spare = budgetParts(project).ready; // locked for future stages, not promised to the stage in progress
  const unspent = totalFunded(project) - totalPaid(project); // everything not yet paid out
  const amount = stop ? unspent : spare;
  const split = refundSplit(project.sponsors, amount);

  if (done !== null) {
    return (
      <>
        <h1>Money on its way back</h1>
        <section className="group">
          {done.map((s) => (
            <div className="row" key={s.name}>
              <div className="grow">{s.name}</div>
              <span className="muted">{money(s.amount)}</span>
            </div>
          ))}
        </section>
        <p className="note">Sent back by Interac. It never left the locked account, so nothing has to come back out of India.</p>
        <Link className="button" href={`/homes/${project.id}`}>
          Done
        </Link>
      </>
    );
  }

  return (
    <>
      <Back href={`/homes/${project.id}`} label={project.name} />
      <h1>Money back</h1>
      <p className="intro">Overcharged, a stage cost less, or the build stopped? Money that hasn't been released comes straight back. Paid stages can't be undone.</p>

      {project.frozen ? (
        <p className="note">This build is stopped and its unspent money has already gone back.</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            act({ loading: `Returning ${money(amount)}`, done: `${money(amount)} returned` }, () => {
              returnMoney(project.id, amount, stop);
              setDone(split);
            });
          }}
        >
          <h3>How much?</h3>
          <fieldset className="group">
            <legend className="hidden">How much?</legend>
            <label className="row">
              <input type="radio" name="kind" checked={!stop} onChange={() => setStop(false)} />
              <span className="grow">
                <span>Money for future stages</span>
                <small>The build keeps going</small>
              </span>
              <span className="muted">{money(spare)}</span>
            </label>
            <label className="row">
              <input type="radio" name="kind" checked={stop} onChange={() => setStop(true)} />
              <span className="grow">
                <span>Stop the build and return everything unspent</span>
                <small>Includes money held for the stage in progress</small>
              </span>
              <span className="muted">{money(unspent)}</span>
            </label>
          </fieldset>

          <h3>Who gets it</h3>
          <section className="group">
            {split.map((s) => (
              <div className="row" key={s.name}>
                <div className="grow">{s.name}</div>
                <span className="muted">{money(s.amount)}</span>
              </div>
            ))}
          </section>
          <p className="note">Split by what each person paid in.</p>

          <button className="button" type="submit" disabled={busy || amount <= 0}>
            Return {money(amount)}
          </button>
        </form>
      )}
    </>
  );
}

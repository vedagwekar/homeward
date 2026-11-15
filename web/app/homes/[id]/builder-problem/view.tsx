"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { claimStatus, defaultPayback, duration, isActive, isStalled } from "@/lib/project.mjs";
import { act, claimDefault, familyRole, finalizeDefault, useMoney, useNow, useProjects, useSession, useStatus, withdrawClaim } from "@/lib/store";
import { Back } from "../../../icons";

export default function View({ id }: { id: string }) {
  const money = useMoney();
  const project = useProjects().find((p) => p.id === id);
  const session = useSession();
  const busy = useStatus().state === "loading";
  const now = useNow();
  const [picked, setPicked] = useState("");
  if (!project) notFound();
  const sec = project.security;
  if (!sec) notFound();

  const as = familyRole(project, session);
  // The stage the builder is failing on: the one in progress, or the next one still to do.
  const open = project.stages.find(isActive) ?? project.stages.find((s) => s.status !== "paid") ?? project.stages[0];
  const slug = picked || open.slug;
  const stage = project.stages.find((s) => s.slug === slug)!;
  const status = claimStatus(sec, now);
  const claimed = project.stages.find((s) => s.slug === sec.claim?.stage);
  const back = defaultPayback(project);
  const credit = project.sponsors.reduce((t, s) => t + (s.credit ?? 0), 0);
  const stalled = now > 0 && isStalled(stage, sec, now);

  return (
    <>
      <Back href={`/homes/${project.id}`} label={project.name} />
      <h1>Builder stopped?</h1>

      {sec.defaulted ? (
        <>
          <section className="group pad">
            <strong>Build ended</strong>
            <p className="now">Your money is back, with the builder's deposit.</p>
          </section>
          {credit > 0 && <p className="note">{money(credit)} can go into a new build with no fee.</p>}
          <Link className="button" href="/">
            Back to your homes
          </Link>
        </>
      ) : (
        <>
          <p className="intro">Report it. Unpaid money and the builder's deposit come back to you.</p>

          {status.phase === "none" && (
            <>
              <h3>Which stage?</h3>
              <section className="group">
                {project.stages
                  .filter((s) => s.status !== "paid")
                  .map((s) => (
                    <label className="row" key={s.slug}>
                      <input type="radio" name="stage" checked={slug === s.slug} onChange={() => setPicked(s.slug)} />
                      <span className="grow">{s.name}</span>
                    </label>
                  ))}
              </section>
              <p className="hint">
                {stalled ? "Quiet for long enough. Counts on its own." : "An engineer will confirm."} The builder gets {duration(sec.responseSecs)} to reply.
              </p>
              <button className="button" type="button" disabled={busy} onClick={() => act({ loading: "Sending", done: "Reported. Nothing is paid or taken yet" }, () => claimDefault(project.id, slug, as))}>
                Report builder stopped
              </button>
            </>
          )}

          {status.phase !== "none" && (
            <>
              <section className="group pad">
                <strong>{claimed?.name ?? "Report"}</strong>
                <p className="now">
                  {status.phase === "needs-engineer" && "Waiting for an engineer to confirm."}
                  {status.phase === "waiting" && `Builder has ${duration(status.secsLeft ?? 0)} to reply.`}
                  {status.phase === "ready" && "Reply time is over."}
                  {status.phase === "contested" && "Builder disputed it. Homeward decides."}
                </p>
              </section>
              {status.phase === "ready" && (
                <>
                  <section className="group">
                    <div className="row">
                      <div className="grow">Not yet paid out</div>
                      <span className="muted">{money(back.unspent)}</span>
                    </div>
                    <div className="row">
                      <div className="grow">Builder's deposit</div>
                      <span className="muted">{money(back.fromBuilder)}</span>
                    </div>
                  </section>
                  <button className="button" type="button" disabled={busy} onClick={() => act({ loading: "Returning", done: `${money(back.unspent + back.fromBuilder)} back to you` }, () => finalizeDefault(project.id))}>
                    Get {money(back.unspent + back.fromBuilder)} back
                  </button>
                </>
              )}
              <button className="button quiet" type="button" disabled={busy} onClick={() => act({ loading: "Withdrawing", done: "Report withdrawn" }, () => withdrawClaim(project.id, as))}>
                Withdraw
              </button>
            </>
          )}
        </>
      )}
    </>
  );
}

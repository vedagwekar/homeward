"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isActive, rupees, shortDate, timeline, totalFunded } from "@/lib/project.mjs";
import { LANGUAGES, SPEECH, smsThread, t } from "@/lib/parent-text.mjs";
import { act, type Project, type Stage, updateStage, useProjects, useSession, useStatus } from "@/lib/store";
import { statusView, Tile } from "../icons";

type Language = (typeof LANGUAGES)[number];

// The stage in progress, in the words a parent would use, in the language they chose.
function now(language: Language, project: Project, stage: Stage) {
  const { name, secondName } = project.engineer;
  if (stage.amma === "recheck") return stage.secondDecision ? t(language, "secondDone") : t(language, "second", { name: secondName });
  if (stage.engineerDecision === "approved") return t(language, "approved", { name });
  if (stage.status === "rejected") return t(language, "problem", { name });
  if (stage.status === "submitted") return t(language, "checking", { name });
  return t(language, "working");
}

// Reads the card aloud in the phone's own voice, in the chosen language when the phone has one.
function listen(language: Language, text: string) {
  const say = new SpeechSynthesisUtterance(text);
  say.lang = (SPEECH as Record<string, string>)[language];
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(say);
}

export default function Parents() {
  const projects = useProjects();
  const [who, setWho] = useState(0);
  const [phone, setPhone] = useState<"smart" | "basic">("smart");
  const [language, setLanguage] = useState<Language>("English");
  const [big, setBig] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false); // known only in the browser, so set after load
  useEffect(() => setCanSpeak("speechSynthesis" in window), []);
  // A signed-in parent sees their own home. Anyone else can look at either.
  const session = useSession();
  const mine = session?.role === "parent" ? projects.findIndex((p) => p.parent === session.name) : -1;
  const project = projects[mine >= 0 ? mine : who];
  const stage = project.frozen ? undefined : project.stages.find(isActive);
  const ready = stage?.status === "submitted" && stage.engineerDecision === "approved" && !stage.amma;
  const busy = useStatus().state === "loading";
  const L = (key: string, vars?: Record<string, string | number>) => t(language, key, vars);
  const answer = (amma: "ok" | "recheck") =>
    stage &&
    act(
      amma === "ok" ? { loading: "Paying the builder", done: `${stage.name} paid` } : { loading: "Asking for a second check", done: "Second check requested. Nothing paid" },
      () => updateStage(project.id, stage.slug, { amma }),
    );
  const visit = timeline([project]).find((i) => i.track === "site");
  const done = project.stages.filter((s) => s.status === "paid").length;
  const thread = smsThread(language, project, stage);
  const spoken = stage ? `${stage.name}. ${now(language, project, stage)}${ready ? ` ${L("neverPaid")}` : ""}` : L("nothingNow");

  return (
    <div className={big ? "parent big-text" : "parent"} lang={language === "മലയാളം" ? "ml" : language === "ਪੰਜਾਬੀ" ? "pa" : "en"}>
      <h1>{L("myHome")}</h1>
      <p className="intro">{L("nothingToPay")}</p>

      {mine < 0 && (
        <div className="segments" role="group" aria-label="Parent">
          {projects.map((p, i) => (
            <button key={p.id} type="button" aria-pressed={who === i} onClick={() => setWho(i)}>
              {p.parent}
            </button>
          ))}
        </div>
      )}

      <div className="segments" role="group" aria-label="Language">
        {LANGUAGES.map((l) => (
          <button key={l} type="button" aria-pressed={language === l} onClick={() => setLanguage(l)}>
            {l}
          </button>
        ))}
      </div>
      {L("draft") && <p className="hint">{L("draft")}</p>}

      <div className="segments" role="group" aria-label="Phone">
        <button type="button" aria-pressed={phone === "smart"} onClick={() => setPhone("smart")}>
          {L("smartphone")}
        </button>
        <button type="button" aria-pressed={phone === "basic"} onClick={() => setPhone("basic")}>
          {L("basicPhone")}
        </button>
      </div>

      {phone === "basic" ? (
        <>
          <h3>{L("messages")}</h3>
          <section className="phone">
            {thread.length === 0 ? (
              <p className="bubble">{L("noMessages")}</p>
            ) : (
              thread.map((m, i) => (
                <p className="bubble" key={i}>
                  {m.text}
                </p>
              ))
            )}
          </section>
          {ready && (
            <div className="keys">
              <button className="button" type="button" disabled={busy} onClick={() => answer("ok")}>
                {L("reply1")}
              </button>
              <button className="button quiet" type="button" disabled={busy} onClick={() => answer("recheck")}>
                {L("reply2")}
              </button>
            </div>
          )}
          <p className="hint">Basic phones get these as text messages and reply with a number. Simulated here.</p>
        </>
      ) : (
        <>
          <h3>{project.parent}'s house</h3>
          <section className="group">
            <div className="row">
              <Tile name="home" tone="blue" />
              <div className="grow">
                <span>{project.place}</span>
                <small>{L("partsDone", { n: done, total: project.stages.length })}</small>
              </div>
            </div>
          </section>

          <h3>{L("now")}</h3>
          <section className="group pad">
            {stage ? (
              <>
                <strong>{stage.name}</strong>
                <p className="now">{now(language, project, stage)}</p>
                {ready && (
                  <>
                    <div className="keys">
                      <button className="button" type="button" disabled={busy} onClick={() => answer("ok")}>
                        {L("yes")}
                      </button>
                      <button className="button quiet" type="button" disabled={busy} onClick={() => answer("recheck")}>
                        {L("again")}
                      </button>
                    </div>
                    <small>{L("neverPaid")}</small>
                  </>
                )}
              </>
            ) : (
              <p className="now">{L("nothingNow")}</p>
            )}
            <div className="parent-tools">
              <button className="button quiet" type="button" aria-pressed={big} onClick={() => setBig(!big)}>
                {big ? L("normal") : L("bigger")}
              </button>
              {canSpeak && (
                <button className="button quiet" type="button" onClick={() => listen(language, spoken)}>
                  {L("listen")}
                </button>
              )}
            </div>
          </section>

          <Link className="group row live-card" href={`/homes/${project.id}/camera`}>
            <Tile name="home" tone="blue" />
            <div className="grow">
              <strong>{L("watch")}</strong>
              <small>{project.place}</small>
            </div>
            <span className="live-pill">LIVE</span>
          </Link>

          {visit && (
            <>
              <h3>{L("nextOnSite")}</h3>
              <section className="group">
                <div className="row">
                  <span className="date">{shortDate(visit.date)}</span>
                  <div className="grow">{visit.title}</div>
                </div>
              </section>
            </>
          )}

          <h3>{L("allParts")}</h3>
          <section className="group">
            {project.stages.map((s) => {
              const view = statusView[s.status as keyof typeof statusView];
              return (
                <div className="row" key={s.slug}>
                  <Tile name={view.icon} tone={view.tone} />
                  <div className="grow">{s.name}</div>
                  <span className="muted">{s.status === "paid" ? L("finished") : isActive(s) ? L("now") : L("later")}</span>
                </div>
              );
            })}
          </section>

          <h3>{L("yourFamily")}</h3>
          <section className="group">
            <div className="row">
              <span className="avatars" aria-hidden="true">
                {project.sponsors.map((s) => (
                  <span className="avatar" key={s.name}>
                    {s.name[0]}
                  </span>
                ))}
              </span>
              <div className="grow">
                <span>{project.sponsors.map((s) => `${s.name} in ${s.city}`).join(" and ")}</span>
                <small>Have set aside {rupees(totalFunded(project))} for the house.</small>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

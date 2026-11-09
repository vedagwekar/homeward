"use client";

import { useState } from "react";
import { isActive, rupees, shortDate, timeline, totalFunded } from "@/lib/project.mjs";
import { act, type Project, type Stage, updateStage, useProjects, useStatus } from "@/lib/store";
import { statusView, Tile } from "../icons";

// Basic-phone text. The translations need a native speaker's review before the demo.
const sms = {
  English: (stage: string) => `${stage} is ready to pay. Reply 1 for OK, or 2 to check again.`,
  മലയാളം: (stage: string) => `${stage} പണം നൽകാൻ തയ്യാറാണ്. ശരിയെങ്കിൽ 1, വീണ്ടും പരിശോധിക്കാൻ 2 അയയ്ക്കുക.`,
  ਪੰਜਾਬੀ: (stage: string) => `${stage} ਦਾ ਭੁਗਤਾਨ ਤਿਆਰ ਹੈ। ਠੀਕ ਲਈ 1, ਦੁਬਾਰਾ ਜਾਂਚ ਲਈ 2 ਭੇਜੋ।`,
};
type Language = keyof typeof sms;

// The stage in progress, in the words a parent would use.
function now(project: Project, stage: Stage) {
  const { name, secondName } = project.engineer;
  if (stage.amma === "recheck") return stage.secondDecision ? "The second check is done." : `${secondName} will check the work again. Nothing is paid until then.`;
  if (stage.engineerDecision === "approved") return `${name} checked the work. Is it done the way you want?`;
  if (stage.status === "rejected") return `${name} found a problem. The builder will fix it first.`;
  if (stage.status === "submitted") return `${name} is checking the work.`;
  return "The builder is working on this now.";
}

export default function Parents() {
  const projects = useProjects();
  const [who, setWho] = useState(0);
  const [phone, setPhone] = useState<"smart" | "basic">("smart");
  const [language, setLanguage] = useState<Language>("English");
  const project = projects[who];
  const stage = project.frozen ? undefined : project.stages.find(isActive);
  const ready = stage?.status === "submitted" && stage.engineerDecision === "approved" && !stage.amma;
  const busy = useStatus().state === "loading";
  const answer = (amma: "ok" | "recheck") =>
    stage &&
    act(
      amma === "ok" ? { loading: "Paying the builder", done: `${stage.name} paid` } : { loading: "Asking for a second check", done: "Second check requested. Nothing paid" },
      () => updateStage(project.id, stage.slug, { amma }),
    );
  const visit = timeline([project]).find((i) => i.track === "site");
  const done = project.stages.filter((s) => s.status === "paid").length;

  return (
    <>
      <h1>Parents</h1>
      <p className="intro">What a parent sees. Nothing to install and nothing to pay.</p>
      <div className="segments" role="group" aria-label="Parent">
        {projects.map((p, i) => (
          <button key={p.id} type="button" aria-pressed={who === i} onClick={() => setWho(i)}>
            {p.parent}
          </button>
        ))}
      </div>
      <div className="segments" role="group" aria-label="Phone">
        <button type="button" aria-pressed={phone === "smart"} onClick={() => setPhone("smart")}>
          Smartphone
        </button>
        <button type="button" aria-pressed={phone === "basic"} onClick={() => setPhone("basic")}>
          Basic phone
        </button>
      </div>

      {phone === "basic" ? (
        <>
          <div className="segments" role="group" aria-label="Language">
            {(Object.keys(sms) as Language[]).map((l) => (
              <button key={l} type="button" aria-pressed={language === l} onClick={() => setLanguage(l)}>
                {l}
              </button>
            ))}
          </div>
          <section className="phone">
            <p className="bubble">
              {ready ? sms[language](stage.name) : stage?.amma === "recheck" ? "Second check requested. No money will move until it's done." : "No messages right now."}
            </p>
          </section>
          {ready && (
            <div className="keys">
              <button className="button" type="button" disabled={busy} onClick={() => answer("ok")}>
                1 OK
              </button>
              <button className="button quiet" type="button" disabled={busy} onClick={() => answer("recheck")}>
                2 Check again
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="parent">
          <h3>{project.parent}'s house</h3>
          <section className="group">
            <div className="row">
              <Tile name="home" tone="blue" />
              <div className="grow">
                <span>{project.place}</span>
                <small>
                  {done} of {project.stages.length} parts finished
                </small>
              </div>
            </div>
          </section>

          <h3>Now</h3>
          <section className="group pad">
            {stage ? (
              <>
                <strong>{stage.name}</strong>
                <p className="now">{now(project, stage)}</p>
                {ready && (
                  <>
                    <div className="keys">
                      <button className="button" type="button" disabled={busy} onClick={() => answer("ok")}>
                        Yes, it's done
                      </button>
                      <button className="button quiet" type="button" disabled={busy} onClick={() => answer("recheck")}>
                        Check again
                      </button>
                    </div>
                    <small>Nothing is paid until you say yes.</small>
                  </>
                )}
              </>
            ) : (
              <p className="now">Nothing needs you right now.</p>
            )}
          </section>

          {visit && (
            <>
              <h3>Next on site</h3>
              <section className="group">
                <div className="row">
                  <span className="date">{shortDate(visit.date)}</span>
                  <div className="grow">{visit.title}</div>
                </div>
              </section>
            </>
          )}

          <h3>All parts</h3>
          <section className="group">
            {project.stages.map((s) => {
              const view = statusView[s.status as keyof typeof statusView];
              return (
                <div className="row" key={s.slug}>
                  <Tile name={view.icon} tone={view.tone} />
                  <div className="grow">{s.name}</div>
                  <span className="muted">{s.status === "paid" ? "Finished" : isActive(s) ? "Now" : "Later"}</span>
                </div>
              );
            })}
          </section>

          <h3>Your family</h3>
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
        </div>
      )}
    </>
  );
}

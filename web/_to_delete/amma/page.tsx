"use client";

import { useState } from "react";
import { activeStage, updateStage, useProjects } from "@/lib/store";

// Simulated SMS, because many parents use basic phones. Rivan owns this screen.
const text = {
  English: (stage: string) => `${stage} is ready to pay. Reply 1 for OK, or 2 to check again.`,
  // Needs a native speaker's review before the demo.
  മലയാളം: (stage: string) => `${stage} പണം നൽകാൻ തയ്യാറാണ്. ശരിയെങ്കിൽ 1, വീണ്ടും പരിശോധിക്കാൻ 2 അയയ്ക്കുക.`,
  ਪੰਜਾਬੀ: (stage: string) => `${stage} ਦਾ ਭੁਗਤਾਨ ਤਿਆਰ ਹੈ। ਠੀਕ ਲਈ 1, ਦੁਬਾਰਾ ਜਾਂਚ ਲਈ 2 ਭੇਜੋ।`,
};
type Language = keyof typeof text;

export default function Amma() {
  const active = activeStage(useProjects());
  const [language, setLanguage] = useState<Language>("English");
  const ready = active?.stage.engineerDecision === "approved" && !active.stage.amma;

  return (
    <>
      <h1>Amma's phone</h1>
      <p className="intro">Simulated SMS. No app or smartphone needed.</p>
      <div className="segments" role="group" aria-label="Language">
        {(Object.keys(text) as Language[]).map((l) => (
          <button key={l} type="button" aria-pressed={language === l} onClick={() => setLanguage(l)}>
            {l}
          </button>
        ))}
      </div>
      <section className="phone">
        {ready ? (
          <p className="bubble">{text[language](active.stage.name)}</p>
        ) : (
          <p className="bubble">{active?.stage.amma === "recheck" ? "Second check requested. No money will move until it's done." : "No messages right now."}</p>
        )}
      </section>
      {ready && (
        <div className="keys">
          <button className="button" type="button" onClick={() => updateStage(active.project.id, active.stage.slug, { amma: "ok" })}>
            1 OK
          </button>
          <button className="button quiet" type="button" onClick={() => updateStage(active.project.id, active.stage.slug, { amma: "recheck" })}>
            2 Check again
          </button>
        </div>
      )}
    </>
  );
}

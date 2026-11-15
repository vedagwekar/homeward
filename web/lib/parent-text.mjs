// Everything the parent sees, in three languages. These are draft translations: a native speaker
// still has to check them before they go in front of a real family.
export const LANGUAGES = ["English", "മലയാളം", "ਪੰਜਾਬੀ"];
export const SPEECH = { English: "en-IN", മലയാളം: "ml-IN", ਪੰਜਾਬੀ: "pa-IN" };

const text = {
  English: {
    myHome: "My home", nothingToPay: "Nothing to install or pay.", now: "Now", yes: "Yes, it's done", again: "Check again",
    neverPaid: "Nothing is paid until you say yes.", allParts: "All parts", finished: "Finished", later: "Later",
    yourFamily: "Your family", nextOnSite: "Next on site", smartphone: "Smartphone", basicPhone: "Basic phone",
    working: "The builder is working on this now.", checking: "{name} is checking the work.",
    approved: "{name} checked the work. Is it done the way you want?", problem: "{name} found a problem. The builder will fix it first.",
    second: "{name} will check the work again. Nothing is paid until then.", secondDone: "The second check is done.",
    nothingNow: "Nothing needs you right now.", partsDone: "{n} of {total} parts finished", listen: "Listen", bigger: "Bigger text", normal: "Normal text",
    watch: "Watch the site live", draft: "", messages: "Messages", noMessages: "No messages yet.", reply1: "1 OK", reply2: "2 Check again",
    smsStarted: "{stage} has started. The builder is working on it.",
    smsChecking: "The builder sent the video for {stage}. {name} is checking it.",
    smsReady: "{stage} is ready to pay. Reply 1 for OK, or 2 to check again.",
    smsRecheck: "You asked for a second check on {stage}. No money moves until it is done.",
    smsRejected: "{stage}: a problem was found. No money moves until it is fixed.",
    smsPaid: "{stage} is paid. The builder and workers have been paid.",
    smsSent: "You replied.",
  },
  മലയാളം: {
    myHome: "എന്റെ വീട്", nothingToPay: "ഒന്നും ഇൻസ്റ്റാൾ ചെയ്യുകയോ പണം നൽകുകയോ വേണ്ട.", now: "ഇപ്പോൾ", yes: "ശരി, പണി കഴിഞ്ഞു", again: "വീണ്ടും പരിശോധിക്കുക",
    neverPaid: "നിങ്ങൾ ശരി എന്ന് പറയുന്നത് വരെ ഒന്നും നൽകില്ല.", allParts: "എല്ലാ ഘട്ടങ്ങളും", finished: "പൂർത്തിയായി", later: "പിന്നീട്",
    yourFamily: "നിങ്ങളുടെ കുടുംബം", nextOnSite: "സൈറ്റിൽ അടുത്തത്", smartphone: "സ്മാർട്ട്ഫോൺ", basicPhone: "സാധാരണ ഫോൺ",
    working: "ബിൽഡർ ഇപ്പോൾ ഇതിൽ പണിയെടുക്കുകയാണ്.", checking: "{name} പണി പരിശോധിക്കുന്നു.",
    approved: "{name} പണി പരിശോധിച്ചു. നിങ്ങൾ ആഗ്രഹിച്ചതുപോലെ ആയോ?", problem: "{name} ഒരു പ്രശ്നം കണ്ടെത്തി. ബിൽഡർ ആദ്യം അത് ശരിയാക്കും.",
    second: "{name} വീണ്ടും പണി പരിശോധിക്കും. അതുവരെ ഒന്നും നൽകില്ല.", secondDone: "രണ്ടാമത്തെ പരിശോധന കഴിഞ്ഞു.",
    nothingNow: "ഇപ്പോൾ നിങ്ങൾ ഒന്നും ചെയ്യേണ്ടതില്ല.", partsDone: "{total} ഘട്ടങ്ങളിൽ {n} പൂർത്തിയായി", listen: "കേൾക്കുക", bigger: "വലിയ അക്ഷരം", normal: "സാധാരണ അക്ഷരം",
    watch: "സൈറ്റ് തത്സമയം കാണുക", draft: "ഇത് ഒരു കരട് പരിഭാഷയാണ്. പരിശോധന നടക്കുന്നു.", messages: "സന്ദേശങ്ങൾ", noMessages: "ഇതുവരെ സന്ദേശങ്ങളില്ല.", reply1: "1 ശരി", reply2: "2 വീണ്ടും പരിശോധിക്കുക",
    smsStarted: "{stage} തുടങ്ങി. ബിൽഡർ പണി നടത്തുന്നു.",
    smsChecking: "{stage}-ന്റെ വീഡിയോ ബിൽഡർ അയച്ചു. {name} പരിശോധിക്കുന്നു.",
    smsReady: "{stage} പണം നൽകാൻ തയ്യാറാണ്. ശരിയെങ്കിൽ 1, വീണ്ടും പരിശോധിക്കാൻ 2 അയയ്ക്കുക.",
    smsRecheck: "{stage}-ന് നിങ്ങൾ രണ്ടാമത്തെ പരിശോധന ആവശ്യപ്പെട്ടു. അത് കഴിയുന്നതുവരെ പണം നീങ്ങില്ല.",
    smsRejected: "{stage}: ഒരു പ്രശ്നം കണ്ടെത്തി. അത് ശരിയാക്കുന്നതുവരെ പണം നീങ്ങില്ല.",
    smsPaid: "{stage} പണം നൽകി. ബിൽഡർക്കും തൊഴിലാളികൾക്കും പണം ലഭിച്ചു.",
    smsSent: "നിങ്ങൾ മറുപടി അയച്ചു.",
  },
  ਪੰਜਾਬੀ: {
    myHome: "ਮੇਰਾ ਘਰ", nothingToPay: "ਕੁਝ ਵੀ ਇੰਸਟਾਲ ਜਾਂ ਭੁਗਤਾਨ ਕਰਨ ਦੀ ਲੋੜ ਨਹੀਂ।", now: "ਹੁਣ", yes: "ਹਾਂ, ਕੰਮ ਹੋ ਗਿਆ", again: "ਦੁਬਾਰਾ ਜਾਂਚ ਕਰੋ",
    neverPaid: "ਜਦੋਂ ਤੱਕ ਤੁਸੀਂ ਹਾਂ ਨਹੀਂ ਕਹਿੰਦੇ, ਕੋਈ ਭੁਗਤਾਨ ਨਹੀਂ ਹੁੰਦਾ।", allParts: "ਸਾਰੇ ਪੜਾਅ", finished: "ਪੂਰਾ", later: "ਬਾਅਦ ਵਿੱਚ",
    yourFamily: "ਤੁਹਾਡਾ ਪਰਿਵਾਰ", nextOnSite: "ਸਾਈਟ ਤੇ ਅਗਲਾ", smartphone: "ਸਮਾਰਟਫ਼ੋਨ", basicPhone: "ਸਾਧਾਰਨ ਫ਼ੋਨ",
    working: "ਬਿਲਡਰ ਹੁਣ ਇਸ ਤੇ ਕੰਮ ਕਰ ਰਿਹਾ ਹੈ।", checking: "{name} ਕੰਮ ਦੀ ਜਾਂਚ ਕਰ ਰਿਹਾ ਹੈ।",
    approved: "{name} ਨੇ ਕੰਮ ਦੀ ਜਾਂਚ ਕੀਤੀ। ਕੀ ਇਹ ਤੁਹਾਡੀ ਮਰਜ਼ੀ ਮੁਤਾਬਕ ਹੋਇਆ ਹੈ?", problem: "{name} ਨੂੰ ਸਮੱਸਿਆ ਮਿਲੀ। ਬਿਲਡਰ ਪਹਿਲਾਂ ਇਸਨੂੰ ਠੀਕ ਕਰੇਗਾ।",
    second: "{name} ਕੰਮ ਦੀ ਦੁਬਾਰਾ ਜਾਂਚ ਕਰੇਗਾ। ਉਦੋਂ ਤੱਕ ਕੋਈ ਭੁਗਤਾਨ ਨਹੀਂ।", secondDone: "ਦੂਜੀ ਜਾਂਚ ਪੂਰੀ ਹੋ ਗਈ।",
    nothingNow: "ਹੁਣ ਤੁਹਾਨੂੰ ਕੁਝ ਕਰਨ ਦੀ ਲੋੜ ਨਹੀਂ।", partsDone: "{total} ਵਿੱਚੋਂ {n} ਪੜਾਅ ਪੂਰੇ", listen: "ਸੁਣੋ", bigger: "ਵੱਡੇ ਅੱਖਰ", normal: "ਆਮ ਅੱਖਰ",
    watch: "ਸਾਈਟ ਲਾਈਵ ਦੇਖੋ", draft: "ਇਹ ਮੋਟਾ ਅਨੁਵਾਦ ਹੈ। ਜਾਂਚ ਜਾਰੀ ਹੈ।", messages: "ਸੁਨੇਹੇ", noMessages: "ਹਾਲੇ ਕੋਈ ਸੁਨੇਹਾ ਨਹੀਂ।", reply1: "1 ਠੀਕ", reply2: "2 ਦੁਬਾਰਾ ਜਾਂਚ",
    smsStarted: "{stage} ਸ਼ੁਰੂ ਹੋ ਗਿਆ। ਬਿਲਡਰ ਕੰਮ ਕਰ ਰਿਹਾ ਹੈ।",
    smsChecking: "ਬਿਲਡਰ ਨੇ {stage} ਦੀ ਵੀਡੀਓ ਭੇਜੀ। {name} ਜਾਂਚ ਕਰ ਰਿਹਾ ਹੈ।",
    smsReady: "{stage} ਦਾ ਭੁਗਤਾਨ ਤਿਆਰ ਹੈ। ਠੀਕ ਲਈ 1, ਦੁਬਾਰਾ ਜਾਂਚ ਲਈ 2 ਭੇਜੋ।",
    smsRecheck: "ਤੁਸੀਂ {stage} ਦੀ ਦੂਜੀ ਜਾਂਚ ਮੰਗੀ। ਇਹ ਪੂਰੀ ਹੋਣ ਤੱਕ ਪੈਸਾ ਨਹੀਂ ਹਿੱਲੇਗਾ।",
    smsRejected: "{stage}: ਸਮੱਸਿਆ ਮਿਲੀ। ਠੀਕ ਹੋਣ ਤੱਕ ਪੈਸਾ ਨਹੀਂ ਹਿੱਲੇਗਾ।",
    smsPaid: "{stage} ਦਾ ਭੁਗਤਾਨ ਹੋ ਗਿਆ। ਬਿਲਡਰ ਅਤੇ ਮਜ਼ਦੂਰਾਂ ਨੂੰ ਪੈਸੇ ਮਿਲ ਗਏ।",
    smsSent: "ਤੁਸੀਂ ਜਵਾਬ ਭੇਜਿਆ।",
  },
};

/** One string in the chosen language, with {placeholders} filled in. */
export function t(language, key, vars = {}) {
  const raw = (text[language] ?? text.English)[key] ?? text.English[key] ?? key;
  return raw.replace(/\{(\w+)\}/g, (_, v) => String(vars[v] ?? ""));
}

/** The texts a parent would get on a basic phone, oldest first. The last one may ask for a reply. */
export function smsThread(language, project, stage) {
  const msgs = [];
  for (const s of project.stages) if (s.status === "paid") msgs.push({ text: t(language, "smsPaid", { stage: s.name }) });
  if (stage) {
    const eng = project.engineer.name, second = project.engineer.secondName;
    if (stage.status === "open") msgs.push({ text: t(language, "smsStarted", { stage: stage.name }) });
    else if (stage.status === "rejected") msgs.push({ text: t(language, "smsRejected", { stage: stage.name }) });
    else if (stage.status === "submitted") {
      if (stage.amma === "recheck") {
        msgs.push({ text: t(language, "smsRecheck", { stage: stage.name }) });
        if (stage.secondDecision) msgs.push({ text: t(language, "secondDone") });
      } else if (stage.engineerDecision === "approved") msgs.push({ text: t(language, "smsReady", { stage: stage.name }), reply: true });
      else msgs.push({ text: t(language, "smsChecking", { stage: stage.name, name: stage.engineerDecision ? second : eng }) });
    }
  }
  return msgs;
}

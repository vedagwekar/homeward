// The guided tour: which step of the story a build is at, and who should do it next.
// It reads the build's state, so it works the same in the mock and on Stellar Testnet.
import { isActive, nextStage } from "./project.mjs";

/** Steps in order. `who` says which kind of person acts, `href` is where they do it. */
export function demoStep(project) {
  if (!project) return { id: "none", who: "sponsor", title: "Nothing to show yet", detail: "Press Start over to set up the demo builds.", href: "/" };
  if (project.frozen) return { id: "stopped", who: "sponsor", title: "This build was stopped", detail: "Unspent money went back to the family. Press Start over to run the story again.", href: `/homes/${project.id}` };

  const stage = project.stages.find(isActive);
  if (!stage) {
    const next = nextStage(project);
    if (!next) return { id: "finished", who: "sponsor", title: "Every stage is paid", detail: "Look at the certificates and the Stellar record.", href: "/proof" };
    if (next.stillNeeded > 0) {
      return { id: "fund", who: "sponsor", title: `Lock the money for ${next.stage.name}`, detail: "A family member adds the money. The contract holds it.", href: `/homes/${project.id}/fund` };
    }
    return { id: "start", who: "builder", title: `Start ${next.stage.name}`, detail: "The builder opens the stage. The supplier is paid for materials straight away.", href: "/builder" };
  }

  if (stage.status === "submitted") {
    if (stage.amma === "recheck") {
      if (stage.secondDecision === "rejected") return { id: "locked", who: "sponsor", title: "The money stayed locked", detail: "The second engineer said no. Nothing was paid. Look at the timeline.", href: `/homes/${project.id}` };
      return { id: "second", who: "engineer", title: "The second engineer checks", detail: "Reject it. The recycled footage doesn't show today's code.", href: "/engineer" };
    }
    if (stage.engineerDecision === "approved") return { id: "parent", who: "parent", title: "The parent decides", detail: "Tap Check again. Nothing is paid until she says yes.", href: "/parents" };
    if (!stage.engineerDecision) return { id: "engineer", who: "engineer", title: "The engineer checks the work", detail: "Look at the proof, tick what you saw, approve.", href: "/engineer" };
  }
  if (stage.status === "rejected" && stage.secondDecision === "rejected") {
    return { id: "locked", who: "sponsor", title: "The money stayed locked", detail: "The second engineer said no. Nothing was paid. Look at the timeline.", href: `/homes/${project.id}` };
  }
  return { id: "proof", who: "builder", title: "The builder films the stage code", detail: "Send a video showing today's code. A sample clip works for the demo.", href: "/builder" };
}

export const DEMO_STEPS = ["fund", "start", "proof", "engineer", "parent", "second", "locked"];

import { gates } from "@/lib/project.mjs";
import { type Project, type Stage, useMoney } from "@/lib/store";

const said = { done: "Done", now: "Waiting", failed: "Sent back", todo: "Not yet" };

// Every check a stage's money waits for, in order. Like a parcel tracker, but for a payment.
export default function GateTrack({ project, stage }: { project: Project; stage: Stage }) {
  const money = useMoney();
  return (
    <ol className="gates">
      {gates(stage, project.parent).map((g) => (
        <li key={g.key} className={g.state === "now" ? "current" : g.state}>
          <span className="gate-mark" aria-hidden="true" />
          <span className="grow">
            {g.label}
            <span className="hidden">. {said[g.state as keyof typeof said]}</span>
          </span>
          {g.amount !== undefined && <span className="figure">{money(g.amount)}</span>}
        </li>
      ))}
    </ol>
  );
}

// The stages in order. Done ones are filled, the current one is ringed.
export function StageDots({ project, current }: { project: Project; current?: Stage }) {
  return (
    <ol className="stage-dots" aria-label="Stages">
      {project.stages.map((s, i) => (
        <li key={s.slug} className={s.status === "paid" ? "done" : s === current ? "current" : ""} aria-current={s === current ? "step" : undefined}>
          <span>{i + 1}</span>
          <span className="hidden">{s.name}</span>
        </li>
      ))}
    </ol>
  );
}

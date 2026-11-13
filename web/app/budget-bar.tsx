import { budgetParts } from "@/lib/project.mjs";
import { type Project, useMoney } from "@/lib/store";

export default function BudgetBar({ project, legend = true }: { project: Project; legend?: boolean }) {
  const money = useMoney();
  const parts = budgetParts(project);
  const bar = [
    { label: "Paid", amount: parts.paid, tone: "green" },
    { label: "In progress", amount: parts.waiting, tone: "orange" },
    { label: "Locked", amount: parts.ready, tone: "blue" },
    { label: "Not funded", amount: parts.unfunded, tone: "empty" },
  ];
  return (
    <>
      <div className={legend ? "bar" : "bar thin"} role="img" aria-label={bar.map((b) => `${b.label} ${money(b.amount)}`).join(", ")}>
        {bar.map((b) => (
          <span key={b.label} className={b.tone} style={{ flexGrow: b.amount }} />
        ))}
      </div>
      {legend && (
        <ul className="legend">
          {bar.filter((b) => b.amount > 0).map((b) => (
            <li key={b.label}>
              <span className={`dot ${b.tone}`} />
              {b.label} {money(b.amount)}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

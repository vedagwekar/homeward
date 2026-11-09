import { Back } from "../icons";

const answers = [
  ["The engineer rejects the work", "The money stays locked. The builder fixes the problem and sends new proof. The engineer is paid from Homeward's fee whether they approve or reject, so they have no reason to approve bad work."],
  ["A parent asks for a second check", "Payment stops. A second engineer must approve before any money moves."],
  ["The builder stops working", "Stop the build from the house page under Money back. Unspent money goes back to each family member based on what they paid in. Because it never left the locked account, nothing has to be sent back out of India."],
  ["You were overcharged, or a stage cost less", "Money that hasn't been released can come back to you at any time from Money back, without stopping the build."],
  ["A family member stops paying", "Stages that aren't funded don't start. Each person's contribution stays on the record."],
  ["Who controls the locked money?", "In this demo, a Stellar Testnet contract enforces the rules. A real launch needs a licensed partner, and that isn't confirmed yet."],
  ["Who can see site videos and the camera?", "Only the family and assigned engineers. The site camera points at the building, not at people, workers are told it's there, and clips are deleted after 7 days. Only a fingerprint of each proof video goes on the public record."],
];

export default function Help() {
  return (
    <>
      <Back href="/" label="Homes" />
      <h1>If something goes wrong</h1>
      <section className="group">
        {answers.map(([q, a]) => (
          <details className="answer" key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </>
  );
}

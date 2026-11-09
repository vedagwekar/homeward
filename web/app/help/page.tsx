import { Back } from "../icons";

const answers = [
  ["The engineer rejects the work", "The money stays locked. The builder fixes the problem and sends new proof. The engineer is paid from Homeward's fee whether they approve or reject, so they have no reason to approve bad work."],
  ["A parent asks for a second check", "Payment stops. A second engineer must approve before any money moves."],
  ["The builder stops working", "You can freeze the project. In this demo, unspent money goes back to each family member based on what they paid in."],
  ["A family member stops paying", "Stages that aren't funded don't start. Each person's contribution stays on the record."],
  ["Who controls the locked money?", "In this demo, a Stellar Testnet contract enforces the rules. A real launch needs a licensed partner, and that isn't confirmed yet."],
  ["Who can see site videos?", "Only the family and assigned engineers should see them. Only a video fingerprint goes on the public record. Video retention rules still need to be set before launch."],
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

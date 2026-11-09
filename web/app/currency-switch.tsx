"use client";

import { setCurrency, useCurrency } from "@/lib/store";

export default function CurrencySwitch() {
  const currency = useCurrency();
  return (
    <div className="segments" role="group" aria-label="Show money in">
      <button type="button" aria-pressed={currency === "INR"} onClick={() => setCurrency("INR")}>
        ₹ Rupees
      </button>
      <button type="button" aria-pressed={currency === "CAD"} onClick={() => setCurrency("CAD")}>
        $ CAD
      </button>
    </div>
  );
}

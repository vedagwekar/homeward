"use client";

import { setCurrency, useCurrency, useHomeCurrency } from "@/lib/store";

export default function CurrencySwitch() {
  const currency = useCurrency();
  const home = useHomeCurrency();
  return (
    <div className="segments" role="group" aria-label="Show money in">
      <button type="button" aria-pressed={currency === "INR"} onClick={() => setCurrency("INR")}>
        ₹ Rupees
      </button>
      <button type="button" aria-pressed={currency === "ABROAD"} onClick={() => setCurrency("ABROAD")}>
        {home.label}
      </button>
    </div>
  );
}

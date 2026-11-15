"use client";

import { useEffect, useState } from "react";

type Quote = { inrPerUsdc: number; updatedAt: number; source?: "coingecko" | "daily" };
const amountFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const rateFormat = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export default function UsdcQuote({ rupees }: { rupees: number }) {
  const [quote, setQuote] = useState<Quote | null | undefined>();

  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch("/api/usdc-rate", { signal: controller.signal });
        if (!response.ok) throw new Error("Rate unavailable");
        const latest: Quote = await response.json();
        if (!controller.signal.aborted) setQuote(latest);
      } catch {
        if (!controller.signal.aborted) setQuote(null);
      }
    }

    void refresh();
    const timer = setInterval(refresh, 60_000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, []);

  return (
    <div className="row">
      <div className="grow">
        <span>Estimated total in USDC</span>
        {quote && (
          <small>
            {rateFormat.format(quote.inrPerUsdc)} per USDC · {new Date(quote.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} ·{" "}
            {quote.source === "daily" ? (
              <a href="https://www.exchangerate-api.com">daily US dollar rate</a>
            ) : (
              <a href="https://www.coingecko.com/en/coins/usdc/inr">CoinGecko</a>
            )}
          </small>
        )}
      </div>
      <span className="muted" role="status">
        {quote ? `≈ ${amountFormat.format(rupees / quote.inrPerUsdc)} USDC` : quote === null ? "Live rate unavailable" : "Loading live rate…"}
      </span>
    </div>
  );
}

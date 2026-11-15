"use client";

import { useEffect, useState } from "react";

type Quote = { inrPerUsdc: number; updatedAt: number; source?: "coingecko" | "daily" };
const amountFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const rateFormat = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export default function UsdcQuote({ rupees }: { rupees: number }) {
  const [quote, setQuote] = useState<Quote | null | undefined>();

  useEffect(() => {
    const controller = new AbortController();
    // The server asks first. If its host is turned away by the price feed, this browser asks the feed itself,
    // which works from an ordinary connection, and then the daily dollar rate.
    async function viaBrowser(signal: AbortSignal): Promise<Quote> {
      try {
        const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=inr&include_last_updated_at=true&precision=full", { signal });
        const price = (await r.json())["usd-coin"];
        const at = price?.last_updated_at * 1000;
        if (r.ok && price.inr > 0 && Math.abs(Date.now() - at) < 10 * 60 * 1000) return { inrPerUsdc: price.inr, updatedAt: at, source: "coingecko" };
      } catch {}
      const r = await fetch("https://open.er-api.com/v6/latest/USD", { signal });
      const body = await r.json();
      if (!r.ok || !(body?.rates?.INR > 0)) throw new Error("No rate");
      return { inrPerUsdc: body.rates.INR, updatedAt: body.time_last_update_unix * 1000, source: "daily" };
    }
    async function refresh() {
      try {
        const response = await fetch("/api/usdc-rate", { signal: controller.signal });
        if (!response.ok) throw new Error("Rate unavailable");
        const latest: Quote = await response.json();
        if (!controller.signal.aborted) setQuote(latest);
      } catch {
        try {
          const latest = await viaBrowser(controller.signal);
          if (!controller.signal.aborted) setQuote(latest);
        } catch {
          if (!controller.signal.aborted) setQuote(null);
        }
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

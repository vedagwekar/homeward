// The live rupee price of one USDC. CoinGecko first (fresh to the minute). If CoinGecko turns the server
// away, which shared cloud hosts often get without an API key, fall back to the daily US dollar rate, which
// is a close stand-in because USDC is pegged to the dollar. The screen says which one it used.
const COINGECKO = "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=inr&include_last_updated_at=true&precision=full";
const DAILY = "https://open.er-api.com/v6/latest/USD";
const MAX_LIVE_AGE_MS = 10 * 60 * 1000;
const MAX_DAILY_AGE_MS = 36 * 60 * 60 * 1000;

type Quote = { inrPerUsdc: number; updatedAt: number; source: "coingecko" | "daily" };

async function coingecko(): Promise<Quote> {
  const key = process.env.COINGECKO_DEMO_API_KEY;
  const response = await fetch(COINGECKO, {
    headers: key ? { "x-cg-demo-api-key": key } : undefined,
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`CoinGecko answered ${response.status}`);
  const price = (await response.json())["usd-coin"];
  const updatedAt = price?.last_updated_at * 1000;
  if (!Number.isFinite(price?.inr) || price.inr <= 0 || !Number.isFinite(updatedAt) || Math.abs(Date.now() - updatedAt) > MAX_LIVE_AGE_MS) {
    throw new Error("CoinGecko price is missing or stale");
  }
  return { inrPerUsdc: price.inr, updatedAt, source: "coingecko" };
}

async function daily(): Promise<Quote> {
  const response = await fetch(DAILY, { next: { revalidate: 600 }, signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`Daily rate answered ${response.status}`);
  const body = await response.json();
  const inr = body?.rates?.INR;
  const updatedAt = body?.time_last_update_unix * 1000;
  if (!Number.isFinite(inr) || inr <= 0 || !Number.isFinite(updatedAt) || Math.abs(Date.now() - updatedAt) > MAX_DAILY_AGE_MS) {
    throw new Error("Daily rate is missing or stale");
  }
  return { inrPerUsdc: inr, updatedAt, source: "daily" };
}

export async function GET() {
  for (const source of [coingecko, daily]) {
    try {
      return Response.json(await source(), { headers: { "Cache-Control": "public, max-age=30" } });
    } catch {
      // try the next source
    }
  }
  return Response.json({ error: "Live USDC rate unavailable" }, { status: 503 });
}

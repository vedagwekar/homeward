const PRICE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=inr&include_last_updated_at=true&precision=full";
const MAX_PRICE_AGE_MS = 10 * 60 * 1000;

export async function GET() {
  try {
    const key = process.env.COINGECKO_DEMO_API_KEY;
    const response = await fetch(PRICE_URL, {
      headers: key ? { "x-cg-demo-api-key": key } : undefined,
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Price feed unavailable");

    const price = (await response.json())["usd-coin"];
    const inrPerUsdc = price?.inr;
    const updatedAt = price?.last_updated_at * 1000;
    if (
      !Number.isFinite(inrPerUsdc) || inrPerUsdc <= 0 ||
      !Number.isFinite(updatedAt) || Math.abs(Date.now() - updatedAt) > MAX_PRICE_AGE_MS
    ) {
      throw new Error("Price is missing or stale");
    }

    return Response.json({ inrPerUsdc, updatedAt }, {
      headers: { "Cache-Control": "public, max-age=30" },
    });
  } catch {
    return Response.json({ error: "Live USDC rate unavailable" }, { status: 503 });
  }
}

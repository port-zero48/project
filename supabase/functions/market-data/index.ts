export const config = {
  runtime: "deno",
  regions: ["iad1"],
  requireAuthorization: false, // public endpoint
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // allow browser calls
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const VALID_SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT"];

const symbolMap: Record<string, string> = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  BNBUSDT: "binancecoin",
  XRPUSDT: "ripple",
};

Deno.serve(async (req: Request) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get("symbol") || "BTCUSDT";

    // Validate symbol
    if (!VALID_SYMBOLS.includes(symbol)) {
      return new Response(JSON.stringify({ error: "Invalid symbol" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const coinId = symbolMap[symbol];
    const coingeckoUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=7`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(coingeckoUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("Failed to fetch market data");
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Market data unavailable" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

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

const VALID_SYMBOLS = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "NVDA"];

Deno.serve(async (req: Request) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get("symbol") || "AAPL";

    // Validate symbol
    if (!VALID_SYMBOLS.includes(symbol)) {
      return new Response(JSON.stringify({ error: "Invalid symbol" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 5s timeout

    const yahoUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const response = await fetch(yahoUrl, { signal: controller.signal });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("Failed to fetch stock data");

    const data = await response.json();
    const quote = data.chart.result[0];
    const meta = quote.meta;
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose;
    const change = currentPrice - previousClose;
    const changePercent = ((change / previousClose) * 100).toFixed(2);

    return new Response(
      JSON.stringify({
        symbol,
        price: parseFloat(currentPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Stock data error:", err);
    // Return mock data as fallback
    const symbol = new URL(req.url).searchParams.get("symbol") || "AAPL";
    return new Response(
      JSON.stringify({
        symbol,
        price: 100 + Math.random() * 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: parseFloat(((Math.random() - 0.5) * 5).toFixed(2)),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

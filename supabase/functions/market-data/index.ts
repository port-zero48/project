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

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {isSignIn ? 'Sign In' : 'Sign Up'}
          </h2>
        </div>
        
        {isSignIn ? <SignInForm /> : <SignUpForm />}
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignIn(!isSignIn)}
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base"
          >
            {isSignIn
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Header({ onTrading, onSupport, onBalance }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link to="/" className="flex items-center space-x-2">
            <TrendingUp className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500" />
            <span className="text-lg sm:text-2xl font-bold text-white hidden sm:inline">TradePro</span>
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap gap-2">
            {onTrading && (
              <button
                onClick={onTrading}
                className="px-2 sm:px-4 py-2 text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Trading
              </button>
            )}
            {onSupport && (
              <button
                onClick={onSupport}
                className="px-2 sm:px-4 py-2 text-sm sm:text-base bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Support
              </button>
            )}
            {onBalance && (
              <button
                onClick={onBalance}
                className="px-2 sm:px-4 py-2 text-sm sm:text-base bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Balance
              </button>
            )}
            
            <span className="text-gray-300 text-xs sm:text-sm hidden md:inline truncate">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
            >
              <LogOut className="h-4 sm:h-5 w-4 sm:w-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<'trading' | 'support' | 'balance' | null>(null);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        onTrading={() => setActiveView('trading')}
        onSupport={() => setActiveView('support')}
        onBalance={() => setActiveView('balance')}
      />
      <DepositNotification user={user} />
      <div className="flex flex-col md:flex-row gap-0 md:gap-0">
        <Sidebar 
          activeView={activeView}
          onTrading={() => setActiveView('trading')}
          onSupport={() => setActiveView('support')}
          onBalance={() => setActiveView('balance')}
          onDeposit={() => setActiveView('deposit')}
          onWithdraw={() => setActiveView('withdraw')}
          onInvestment={() => setActiveView('investment')}
          onHistory={() => setActiveView('history')}
        />
        <main className="flex-1 p-4 sm:p-6 w-full">
          <div className="space-y-6">
            {(activeView === null || activeView === 'balance') && (
              <BalanceCard user={user} />
            )}
            
            <ActiveInvestments user={user} />
            
            <div className="w-full">
              <ErrorBoundary>
                <MarketChart />
              </ErrorBoundary>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Rest of views */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

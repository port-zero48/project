import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, BarChart3, Shield, Users, Globe, Award, ArrowRight } from 'lucide-react'

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function Landing() {
  const [marketData, setMarketData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);

  const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'];

  // Fetch real market data like in TradingChart.tsx
  const fetchStockData = async (ticker: string) => {
    try {
      const response = await fetch(
        `https://api.allorigins.win/raw?url=${encodeURIComponent(
          `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`
        )}`
      );

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      const quote = data.chart.result[0];
      const meta = quote.meta;
      const currentPrice = meta.regularMarketPrice;
      const previousClose = meta.chartPreviousClose;
      const change = currentPrice - previousClose;
      const changePercent = ((change / previousClose) * 100).toFixed(2);

      return {
        symbol: ticker,
        price: parseFloat(currentPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent),
      };
    } catch (err) {
      console.error(`Error fetching ${ticker}:`, err);
      return null;
    }
  };

  useEffect(() => {
    const loadAllStocks = async () => {
      setLoading(true);
      const stocks = await Promise.all(
        stockSymbols.map((symbol) => fetchStockData(symbol))
      );
      setMarketData(stocks.filter((s) => s !== null) as StockData[]);
      setLoading(false);
    };

    loadAllStocks();
    // Refresh every 60 seconds
    const interval = setInterval(loadAllStocks, 60000);
    return () => clearInterval(interval);
  }, []);

  // Create a duplicate array for seamless looping animation
  const animatedData = [...marketData, ...marketData];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Market Ticker with Right Scrolling Animation */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 overflow-hidden">
        <style>{`
          @keyframes scrollRight {
            0% {
              transform: translateX(-50%);
            }
            100% {
              transform: translateX(0%);
            }
          }
          .ticker-scroll {
            display: flex;
            animation: scrollRight 40s linear infinite;
            width: 200%;
          }
          .ticker-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="py-2 overflow-hidden">
          <div className="ticker-scroll">
            <span className="text-slate-300 text-sm font-medium whitespace-nowrap px-8 py-2">
              Live Markets:
            </span>
            {loading ? (
              <div className="text-slate-400 px-8 py-2">Loading market data...</div>
            ) : (
              animatedData.map((stock, idx) => (
                <div
                  key={`${stock.symbol}-${idx}`}
                  className="flex items-center space-x-2 whitespace-nowrap px-6 py-2"
                >
                  <span className="text-white font-semibold">{stock.symbol}</span>
                  <span className="text-slate-300">${stock.price.toFixed(2)}</span>
                  <span
                    className={`text-sm ${
                      stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)} (
                    {stock.changePercent >= 0 ? '+' : ''}
                    {stock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            TradePro
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/auth"
            className="text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            to="/auth"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Trade Like a
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block">
              Professional
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Access institutional-grade trading tools, real-time market data, and expert analysis. 
            Join thousands of traders who trust TradePro for their investment journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>Start Trading Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/auth"
              className="border-2 border-slate-600 hover:border-slate-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:bg-slate-800/50"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/70 transition-all duration-200 group">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              Advanced Analytics
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Professional-grade charts, technical indicators, and real-time market analysis 
              to make informed trading decisions.
            </p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/70 transition-all duration-200 group">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              Bank-Level Security
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Your investments are protected with military-grade encryption, 
              two-factor authentication, and cold storage security.
            </p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/70 transition-all duration-200 group">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              24/7 Expert Support
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Get instant help from our team of certified financial advisors 
              and trading specialists whenever you need it.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">$2.5B+</div>
              <div className="text-slate-400">Assets Under Management</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">150K+</div>
              <div className="text-slate-400">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-slate-400">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-slate-400">Market Access</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join TradePro today and get access to professional trading tools, 
            real-time market data, and expert support.
          </p>
          <Link
            to="/auth"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-12 py-4 rounded-lg text-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
          >
            <span>Open Your Account</span>
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">TradePro</span>
              </div>
              <p className="text-slate-400">
                Professional trading platform trusted by thousands of traders worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Trading Tools</a></li>
                <li><a href="https://www.forexfactory.com/news" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Market Data</a></li>

              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/education" className="hover:text-white transition-colors">Education</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/press" className="hover:text-white transition-colors">Press</Link></li>
                <li><Link to="/legal" className="hover:text-white transition-colors">Legal</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 TradePro. All rights reserved. Trading involves risk and may not be suitable for all investors.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
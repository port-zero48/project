import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, BarChart3, Shield, Users, Globe, Award, ArrowRight, Sparkles, CheckCircle2, ArrowUpRight, Wallet } from 'lucide-react'

type AuthMode = 'login' | 'signup'
type ActivityType = 'invested' | 'withdrawn' | 'deposited' | 'earned'

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface ActivityItem {
  id: number;
  name: string;
  type: ActivityType;
  amount: number;
  detail: string;
}

const ACTIVITY_FEED: ActivityItem[] = Array.from({ length: 20 }, (_, index) => {
  const names = [
    'John Cliff',
    'Maya Chen',
    'Ava Brooks',
    'Daniel Ross',
    'Liam Stone',
    'Sophia Lane',
    'Noah Price',
    'Emma Ford',
    'Olivia Reed',
    'Mason Cole',
  ];

  const types: ActivityType[] = ['invested', 'deposited', 'withdrawn', 'earned'];
  const type = types[index % types.length];
  const detail =
    type === 'withdrawn'
      ? 'just withdrew profit'
      : type === 'deposited'
        ? 'just deposited funds'
        : type === 'earned'
          ? 'just earned profit'
          : 'just invested';

  const amountBase = [1200, 2800, 5400, 9800, 14600, 22500, 34000, 48000, 72000, 100000][index % 10];
  const amount = amountBase + (index % 4) * 1200;

  return {
    id: index + 1,
    name: names[index % names.length],
    type,
    amount,
    detail,
  };
});

export default function Landing() {
  const [marketData, setMarketData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<ActivityItem | null>(null);
  const [authLoading, setAuthLoading] = useState<AuthMode | null>(null);

  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'];

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const getActionLabel = (type: ActivityType) => {
    switch (type) {
      case 'invested':
        return 'invested';
      case 'withdrawn':
        return 'withdrew profit';
      case 'deposited':
        return 'deposited';
      case 'earned':
        return 'earned';
      default:
        return 'updated';
    }
  };

  const getActionIcon = (type: ActivityType) => {
    switch (type) {
      case 'invested':
        return <TrendingUp className="h-4 w-4 text-blue-400" />;
      case 'withdrawn':
        return <Wallet className="h-4 w-4 text-red-400" />;
      case 'deposited':
        return <ArrowUpRight className="h-4 w-4 text-green-400" />;
      case 'earned':
        return <Sparkles className="h-4 w-4 text-amber-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-400" />;
    }
  };

  const handleAuthAction = (mode: AuthMode) => {
    if (authLoading || redirectTimerRef.current) {
      return;
    }

    if (redirectTimerRef.current) {
      window.clearTimeout(redirectTimerRef.current);
    }

    setAuthLoading(mode);

    redirectTimerRef.current = window.setTimeout(() => {
      window.location.assign(`/auth?mode=${mode}`);
    }, 1800);
  };

  useEffect(() => {
    let activityIndex = 0;
    const showNextActivity = () => {
      const nextActivity = ACTIVITY_FEED[activityIndex];
      setNotification(nextActivity);

      if (notificationTimerRef.current) {
        window.clearTimeout(notificationTimerRef.current);
      }

      notificationTimerRef.current = window.setTimeout(() => {
        setNotification(null);
      }, 3200);

      activityIndex = (activityIndex + 1) % ACTIVITY_FEED.length;
    };

    showNextActivity();
    const interval = window.setInterval(showNextActivity, 3600);

    return () => {
      window.clearInterval(interval);
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
      if (notificationTimerRef.current) {
        window.clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  // Fetch real market data like in TradingChart.tsx
  const fetchStockData = async (ticker: string) => {
    try {
      // Call our Edge Function instead of direct API
      const response = await fetch(
        `https://ukizjreylybyidbazgas.supabase.co/functions/v1/market-data?symbol=${ticker}`
      );

      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (err) {
      console.error(`Error fetching ${ticker}:`, err);
      // Return mock data as fallback
      return {
        symbol: ticker,
        price: 100 + Math.random() * 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: parseFloat(((Math.random() - 0.5) * 5).toFixed(2)),
      };
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

  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Market Intelligence',
      description: 'Follow live price action, technical signals, and macro movers from one polished workspace.',
      accent: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Secure by Design',
      description: 'Protect your account with bank-grade security, encrypted sessions, and identity safeguards.',
      accent: 'from-emerald-500 to-green-500',
    },
    {
      icon: Users,
      title: 'Guided Trading Support',
      description: 'Get tailored help from a team that understands active traders, beginners, and portfolio builders.',
      accent: 'from-violet-500 to-fuchsia-500',
    },
    {
      icon: Globe,
      title: 'Global Market Access',
      description: 'Trade across forex, equities, crypto, and more with a single streamlined platform.',
      accent: 'from-amber-500 to-orange-500',
    },
  ];

  const steps = [
    { title: 'Create your account', description: 'Start in minutes with a simple onboarding flow and secure verification.' },
    { title: 'Fund and explore', description: 'Deposit instantly, view live market data, and discover the tools that fit your strategy.' },
    { title: 'Trade with confidence', description: 'Monitor the market, execute smarter, and manage risk from one dashboard.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {authLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/95 p-8 text-center shadow-2xl shadow-slate-950/40">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            <p className="mt-4 text-lg font-semibold text-white">
              {authLoading === 'login' ? 'Signing you in...' : 'Preparing your account...'}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {authLoading === 'login'
                ? 'Your dashboard is loading with your latest deposits, earnings, and investments.'
                : 'We are setting up your secure account for deposits, withdrawals, and investments.'}
            </p>
          </div>
        </div>
      )}

      {notification && (
        <div className="pointer-events-none fixed right-3 top-20 z-[70] flex w-[min(90vw,20rem)] flex-col gap-2 sm:right-6">
          <div className="max-w-[20rem] rounded-xl border border-slate-700/80 bg-slate-950/95 px-4 py-3 shadow-xl shadow-slate-950/40 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-slate-800 p-2 text-slate-100">
                {getActionIcon(notification.type)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {notification.name} {getActionLabel(notification.type)}
                </p>
                <p className="text-sm font-bold text-emerald-300">
                  {currencyFormatter.format(notification.amount)}
                </p>
                <p className="text-xs font-semibold text-slate-300">{notification.detail}</p>
              </div>
            </div>
          </div>
        </div>
      )}

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

      <nav className="container py-6 flex justify-between items-center">
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
            onClick={(event) => {
              event.preventDefault();
              handleAuthAction('login');
            }}
            className="text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            to="/auth"
            onClick={(event) => {
              event.preventDefault();
              handleAuthAction('signup');
            }}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="container py-16">
        <section className="rounded-[2rem] border border-slate-700/60 bg-slate-900/60 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl md:p-12">
          <div className="mb-10 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300">
              <Sparkles className="h-4 w-4" /> Trusted by 150K+ active traders
            </span>
            <span className="text-sm text-slate-400">Real-time insights • Secure onboarding • Professional tools</span>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl">
                Trade with
                <span className="mt-3 block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  clarity and confidence.
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 lg:mx-0">
                Build smarter decisions with live market intelligence, streamlined execution, and a platform designed for ambitious traders.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  to="/auth"
                  onClick={(event) => {
                    event.preventDefault();
                    handleAuthAction('signup');
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:from-blue-600 hover:to-cyan-600"
                >
                  <span>Start Trading Now</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/auth"
                  onClick={(event) => {
                    event.preventDefault();
                    handleAuthAction('login');
                  }}
                  className="rounded-xl border border-slate-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:border-slate-400 hover:bg-slate-800/60"
                >
                  Sign in
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700/70 bg-slate-950/70 p-6 shadow-xl shadow-slate-950/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Live Market Pulse</p>
                  <p className="mt-2 text-3xl font-semibold text-white">$2.4T+</p>
                </div>
                <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400">
                  <Award className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  ['24/7 market access', 'Stay connected to opportunities across global sessions'],
                  ['Instant analysis', 'Track momentum, volatility, and trends in real time'],
                  ['Secure capital movement', 'Move funds and monitor activity with confidence'],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm text-slate-400">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Why TradePro</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Everything you need to trade like a professional</h2>
            </div>
            <p className="max-w-2xl text-slate-400">From real-time insight to secure onboarding, every layer of the experience is designed to help you move faster and think clearer.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group rounded-2xl border border-slate-700/60 bg-slate-800/50 p-8 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:bg-slate-800/70">
                  <div className={`mb-6 inline-flex rounded-xl bg-gradient-to-r ${feature.accent} p-3 text-white shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-20 rounded-[2rem] border border-slate-700/60 bg-slate-800/30 p-8 backdrop-blur-sm md:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Start fast, stay informed, and grow with confidence</h2>
              <p className="mt-4 text-slate-400 leading-relaxed">A smooth onboarding experience paired with premium tools makes it easy to move from first step to first trade without friction.</p>
            </div>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-semibold text-cyan-300">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{step.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-[2rem] border border-slate-700/60 bg-gradient-to-r from-slate-900/80 via-blue-950/70 to-slate-900/80 p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Why traders stay</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Professional-grade experiences that feel effortless every day</h2>
              <p className="mt-4 text-slate-400 leading-relaxed">Whether you are scaling your first portfolio or refining a high-conviction strategy, TradePro delivers speed, reliability, and clarity in one place.</p>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/70 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <p className="text-white font-semibold">Trusted by disciplined investors worldwide</p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="text-center rounded-xl bg-slate-900/80 p-4">
                  <p className="text-2xl font-semibold text-white">99.9%</p>
                  <p className="mt-1 text-sm text-slate-400">platform uptime</p>
                </div>
                <div className="text-center rounded-xl bg-slate-900/80 p-4">
                  <p className="text-2xl font-semibold text-white">24/7</p>
                  <p className="mt-1 text-sm text-slate-400">market access</p>
                </div>
                <div className="text-center rounded-xl bg-slate-900/80 p-4">
                  <p className="text-2xl font-semibold text-white">150K+</p>
                  <p className="mt-1 text-sm text-slate-400">active users</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-[2rem] border border-slate-700/60 bg-slate-900/60 p-8 backdrop-blur-sm md:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Built for modern traders</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">A platform engineered to keep you ahead of the market</h2>
              <p className="mt-4 text-slate-400 leading-relaxed">TradePro combines intelligent dashboards, live data, and a calm interface so you can focus on opportunities instead of noise. The experience is crafted to feel premium from the first glance to your daily routine.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/70 p-4">
                  <p className="font-semibold text-white">Actionable insights</p>
                  <p className="mt-2 text-sm text-slate-400">Convert market movement into smarter decisions with clean dashboards and reliable updates.</p>
                </div>
                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/70 p-4">
                  <p className="font-semibold text-white">Professional workflow</p>
                  <p className="mt-2 text-sm text-slate-400">Move from discovery to execution without switching between tools and distractions.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-950/90 via-blue-950/70 to-slate-900/90 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-cyan-500/10 p-2 text-cyan-300">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-white font-semibold">Why serious investors choose TradePro</p>
              </div>
              <ul className="mt-6 space-y-4 text-sm text-slate-300">
                <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> Crisp, modern experience designed to reduce friction and increase focus.</li>
                <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> Live market visibility paired with reliable execution tools for decisive action.</li>
                <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> Strong security and support so your account and strategy stay protected.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-[2rem] border border-slate-700/60 bg-gradient-to-r from-slate-900/80 via-blue-950/70 to-slate-900/80 p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Why traders stay</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Professional-grade experiences that feel effortless every day</h2>
              <p className="mt-4 text-slate-400 leading-relaxed">Whether you are scaling your first portfolio or refining a high-conviction strategy, TradePro delivers speed, reliability, and clarity in one place.</p>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/70 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <p className="text-white font-semibold">Trusted by disciplined investors worldwide</p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="text-center rounded-xl bg-slate-900/80 p-4">
                  <p className="text-2xl font-semibold text-white">99.9%</p>
                  <p className="mt-1 text-sm text-slate-400">platform uptime</p>
                </div>
                <div className="text-center rounded-xl bg-slate-900/80 p-4">
                  <p className="text-2xl font-semibold text-white">24/7</p>
                  <p className="mt-1 text-sm text-slate-400">market access</p>
                </div>
                <div className="text-center rounded-xl bg-slate-900/80 p-4">
                  <p className="text-2xl font-semibold text-white">150K+</p>
                  <p className="mt-1 text-sm text-slate-400">active users</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 text-center">
          <h2 className="text-4xl font-bold text-white">Ready to move from curiosity to confidence?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-300">Join TradePro today and experience a cleaner, smarter way to follow the markets and act on opportunity.</p>
          <Link
            to="/auth"
            onClick={(event) => {
              event.preventDefault();
              handleAuthAction('signup');
            }}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-12 py-4 text-xl font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:from-blue-600 hover:to-cyan-600"
          >
            <span>Open Your Account</span>
            <ArrowRight className="h-6 w-6" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm mt-20">
        <div className="container py-12">
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
            <p>&copy; 2024 TradePro. All rights reserved. Trading involves risk but what can be achieved without taking it.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
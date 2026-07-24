import { useEffect, useState } from 'react';
import { ArrowUpRight, Sparkles, TrendingUp, Wallet } from 'lucide-react';

type ActivityType = 'invested' | 'withdrawn' | 'deposited' | 'earned';

interface ActivityItem {
  id: string;
  name: string;
  type: ActivityType;
  amount: number;
  detail: string;
}

const ACTIVITY_FEED: ActivityItem[] = Array.from({ length: 40 }, (_, index) => {
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
    'Isabella King',
    'Ethan Cruz',
    'Charlotte Bell',
    'James Walker',
    'Amelia Scott',
    'Ben Carter',
    'Grace Turner',
    'Lucas Brooks',
    'Nora Hughes',
    'Owen Parker',
    'Zara Mitchell',
    'Caleb Foster',
    'Hannah Reed',
    'Leo Adams',
    'Ivy Collins',
    'Nathan Brooks',
    'Sophie Bennett',
    'Aaron Diaz',
    'Ruby Flores',
    'Dylan Miller',
    'Mia Turner',
    'Julian Park',
    'Elena Cruz',
    'Harper Reed',
    'Theo Brooks',
    'Chloe Mason',
    'Luca Bennett',
    'Piper Ward',
    'Kai Summers',
    'Aria Foster',
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
    id: `${index + 1}`,
    name: names[index % names.length],
    type,
    amount,
    detail,
  };
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function getActionLabel(type: ActivityType) {
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
}

function getActionIcon(type: ActivityType) {
  switch (type) {
    case 'invested':
      return <TrendingUp className="h-4 w-4 text-blue-400" />;
    case 'withdrawn':
      return <Wallet className="h-4 w-4 text-red-400" />;
    case 'deposited':
      return <ArrowUpRight className="h-4 w-4 text-green-400" />;
    case 'earned':
      return <Sparkles className="h-4 w-4 text-yellow-400" />;
    default:
      return <Sparkles className="h-4 w-4 text-blue-400" />;
  }
}

export default function LiveActivityNotifications() {
  const [toast, setToast] = useState<ActivityItem | null>(null);
  const [cursor, setCursor] = useState(0);
  const [featuredFeed, setFeaturedFeed] = useState<ActivityItem[]>(() => ACTIVITY_FEED.slice(0, 8));

  useEffect(() => {
    let timeoutId: ReturnType<typeof window.setTimeout>;

    const interval = window.setInterval(() => {
      setCursor((prev) => {
        const nextIndex = (prev + 1) % ACTIVITY_FEED.length;
        const nextActivity = ACTIVITY_FEED[nextIndex];

        setToast(nextActivity);
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => setToast(null), 2800);

        const start = nextIndex;
        const nextFeed = ACTIVITY_FEED.slice(start, start + 8).concat(
          start + 8 > ACTIVITY_FEED.length ? ACTIVITY_FEED.slice(0, (start + 8) % ACTIVITY_FEED.length) : [],
        );
        setFeaturedFeed(nextFeed);

        return nextIndex;
      });
    }, 3200);

    return () => {
      window.clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="relative">
      <div className="pointer-events-none fixed right-3 top-20 z-40 flex w-[min(90vw,20rem)] flex-col gap-2 sm:right-6">
        {toast && (
          <div className="max-w-[20rem] rounded-xl border border-slate-700/80 bg-slate-950/95 px-4 py-3 shadow-xl shadow-slate-950/40 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-slate-800 p-2 text-slate-100">
                {getActionIcon(toast.type)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {toast.name} {getActionLabel(toast.type)}
                </p>
                <p className="text-sm font-bold text-emerald-300">
                  {currencyFormatter.format(toast.amount)}
                </p>
                <p className="text-xs font-semibold text-slate-300">{toast.detail}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-transparent bg-transparent p-3 shadow-none sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
            <h3 className="text-sm font-semibold text-white sm:text-base">Live Investor Activity</h3>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300 sm:px-2.5 sm:text-xs">
            Motivating the room
          </span>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          {featuredFeed.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-950/90 px-3 py-3 sm:px-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                <p className="truncate text-[11px] text-slate-300 sm:text-xs">{item.detail}</p>
              </div>
              <div className="ml-2 text-right">
                <p className="text-sm font-semibold text-emerald-300">{currencyFormatter.format(item.amount)}</p>
                <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-[11px]">{getActionLabel(item.type)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Sparkles, TrendingUp, Wallet } from 'lucide-react';

type ActivityType = 'invested' | 'withdrawn' | 'deposited' | 'earned';

interface ActivityItem {
  id: string;
  name: string;
  type: ActivityType;
  amount: number;
  detail: string;
}

const ACTIVITY_FEED: ActivityItem[] = [
  { id: '1', name: 'John Cliff', type: 'invested', amount: 3000, detail: 'just invested' },
  { id: '2', name: 'Maya Chen', type: 'withdrawn', amount: 2000, detail: 'just withdrew profit' },
  { id: '3', name: 'Ava Brooks', type: 'invested', amount: 4800, detail: 'just invested' },
  { id: '4', name: 'Daniel Ross', type: 'earned', amount: 950, detail: 'just earned profit' },
  { id: '5', name: 'Liam Stone', type: 'deposited', amount: 1250, detail: 'just deposited funds' },
  { id: '6', name: 'Sophia Lane', type: 'withdrawn', amount: 1600, detail: 'just withdrew profit' },
  { id: '7', name: 'Noah Price', type: 'invested', amount: 7200, detail: 'just invested' },
  { id: '8', name: 'Emma Ford', type: 'earned', amount: 1100, detail: 'just earned profit' },
  { id: '9', name: 'Olivia Reed', type: 'deposited', amount: 2200, detail: 'just deposited funds' },
  { id: '10', name: 'Mason Cole', type: 'invested', amount: 5400, detail: 'just invested' },
  { id: '11', name: 'Isabella King', type: 'withdrawn', amount: 3000, detail: 'just withdrew profit' },
  { id: '12', name: 'Ethan Cruz', type: 'earned', amount: 1350, detail: 'just earned profit' },
  { id: '13', name: 'Charlotte Bell', type: 'deposited', amount: 1850, detail: 'just deposited funds' },
  { id: '14', name: 'James Walker', type: 'invested', amount: 8900, detail: 'just invested' },
  { id: '15', name: 'Amelia Scott', type: 'withdrawn', amount: 4100, detail: 'just withdrew profit' },
  { id: '16', name: 'Ben Carter', type: 'invested', amount: 6100, detail: 'just invested' },
  { id: '17', name: 'Grace Turner', type: 'earned', amount: 1420, detail: 'just earned profit' },
  { id: '18', name: 'Lucas Brooks', type: 'deposited', amount: 2650, detail: 'just deposited funds' },
  { id: '19', name: 'Nora Hughes', type: 'invested', amount: 7500, detail: 'just invested' },
  { id: '20', name: 'Owen Parker', type: 'withdrawn', amount: 3600, detail: 'just withdrew profit' },
  { id: '21', name: 'Zara Mitchell', type: 'earned', amount: 1280, detail: 'just earned profit' },
  { id: '22', name: 'Caleb Foster', type: 'deposited', amount: 3100, detail: 'just deposited funds' },
  { id: '23', name: 'Hannah Reed', type: 'invested', amount: 9200, detail: 'just invested' },
  { id: '24', name: 'Leo Adams', type: 'withdrawn', amount: 4300, detail: 'just withdrew profit' },
  { id: '25', name: 'Ivy Collins', type: 'earned', amount: 1540, detail: 'just earned profit' },
  { id: '26', name: 'Nathan Brooks', type: 'deposited', amount: 3400, detail: 'just deposited funds' },
  { id: '27', name: 'Sophie Bennett', type: 'invested', amount: 8600, detail: 'just invested' },
  { id: '28', name: 'Aaron Diaz', type: 'withdrawn', amount: 4900, detail: 'just withdrew profit' },
  { id: '29', name: 'Ruby Flores', type: 'earned', amount: 1670, detail: 'just earned profit' },
  { id: '30', name: 'Dylan Miller', type: 'deposited', amount: 3900, detail: 'just deposited funds' },
];

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

  const featuredFeed = useMemo(() => ACTIVITY_FEED.slice(0, 10), []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof window.setTimeout>;

    const interval = window.setInterval(() => {
      setCursor((prev) => {
        const nextIndex = (prev + 1) % ACTIVITY_FEED.length;
        const nextActivity = ACTIVITY_FEED[nextIndex];

        setToast(nextActivity);
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => setToast(null), 2800);

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

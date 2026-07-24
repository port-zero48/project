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
  const [activeToast, setActiveToast] = useState<ActivityItem | null>(null);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const showNextToast = () => {
      setCursor((prev) => {
        const nextIndex = (prev + 1) % ACTIVITY_FEED.length;
        const nextActivity = ACTIVITY_FEED[nextIndex];
        const variance = (prev % 5) + 1;
        const adjustedAmount = Math.round(nextActivity.amount * (1 + variance * 0.04));
        const variedActivity = {
          ...nextActivity,
          amount: adjustedAmount,
          name: `${nextActivity.name.split(' ')[0]} ${nextActivity.name.split(' ')[1]}`,
          detail: nextActivity.type === 'earned'
            ? 'just earned profit'
            : nextActivity.type === 'invested'
              ? 'just invested'
              : nextActivity.type === 'withdrawn'
                ? 'just withdrew profit'
                : 'just deposited funds',
        };

        setActiveToast(variedActivity);
        return nextIndex;
      });
    };

    showNextToast();

    const interval = window.setInterval(showNextToast, 3200);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeToast) return;

    const timeout = window.setTimeout(() => {
      setActiveToast(null);
    }, 2400);

    return () => window.clearTimeout(timeout);
  }, [activeToast]);

  if (!activeToast) return null;

  return (
    <div className="pointer-events-none fixed right-2 top-16 z-50 max-w-[78vw] sm:right-4 sm:top-20 sm:max-w-[18rem]">
      <div className="rounded-2xl border border-white/25 bg-white/20 p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-md sm:p-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 rounded-full bg-emerald-500/15 p-1.5">
            {getActionIcon(activeToast.type)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-900 sm:text-sm">
              {activeToast.name} {getActionLabel(activeToast.type)}
            </p>
            <p className="text-xs text-emerald-700 sm:text-sm">
              {currencyFormatter.format(activeToast.amount)}
            </p>
            <p className="truncate text-[11px] text-slate-700 sm:text-xs">{activeToast.detail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

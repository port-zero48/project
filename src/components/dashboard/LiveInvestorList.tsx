import { useEffect, useState } from 'react';

type InvestorAction = 'invested' | 'withdrawn' | 'earned' | 'deposited';

interface InvestorItem {
  id: string;
  name: string;
  action: InvestorAction;
  amount: number;
}

const INVESTOR_NAMES = [
  'Ava Brooks', 'Maya Chen', 'Noah Price', 'Emma Ford', 'Olivia Reed',
  'Mason Cole', 'Isabella King', 'Ethan Cruz', 'Charlotte Bell', 'James Walker',
  'Amelia Scott', 'Ben Carter', 'Grace Turner', 'Lucas Brooks', 'Nora Hughes',
  'Owen Parker', 'Zara Mitchell', 'Caleb Foster', 'Hannah Reed', 'Leo Adams',
  'Ivy Collins', 'Nathan Brooks', 'Sophie Bennett', 'Aaron Diaz', 'Ruby Flores',
  'Dylan Miller', 'John Cliff', 'Liam Stone', 'Sophia Lane', 'Daniel Ross'
];

const INVESTOR_ACTIONS: InvestorAction[] = ['invested', 'withdrawn', 'earned', 'deposited'];

const ACTION_LABELS: Record<InvestorAction, string> = {
  invested: 'invested',
  withdrawn: 'withdrew profit',
  earned: 'earned profit',
  deposited: 'deposited funds',
};

const ACTION_COLORS: Record<InvestorAction, string> = {
  invested: 'text-blue-400',
  withdrawn: 'text-red-400',
  earned: 'text-amber-300',
  deposited: 'text-emerald-400',
};

function getRandomAmount(base: number) {
  const variance = 0.9 + Math.random() * 0.2;
  return Math.round(base * variance / 100) * 100;
}

function getRandomAction(index: number): InvestorAction {
  return INVESTOR_ACTIONS[index % INVESTOR_ACTIONS.length];
}

function getRandomName(index: number) {
  return INVESTOR_NAMES[index % INVESTOR_NAMES.length];
}

function createInitialInvestors() {
  return Array.from({ length: 10 }, (_, index) => ({
    id: `live-investor-${index}`,
    name: getRandomName(index),
    action: getRandomAction(index),
    amount: getRandomAmount(2000 + index * 500),
  }));
}

export default function LiveInvestorList() {
  const [investors, setInvestors] = useState<InvestorItem[]>(createInitialInvestors);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCursor((prev) => {
        const next = prev + 1;
        const newItem: InvestorItem = {
          id: `live-investor-${Date.now()}-${next}`,
          name: getRandomName(next),
          action: getRandomAction(next),
          amount: getRandomAmount(1500 + (next % 10) * 600),
        };

        setInvestors((current) => [newItem, ...current.slice(0, 9)]);
        return next;
      });
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/90 p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Live Investors</h3>
          <p className="text-sm text-gray-400">10 investors updating in real time</p>
        </div>
        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-300">
          Live
        </span>
      </div>

      <div className="space-y-2">
        {investors.map((investor) => (
          <div key={investor.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3">
            <div>
              <p className="text-sm font-semibold text-white">{investor.name}</p>
              <p className="text-xs text-gray-400">{ACTION_LABELS[investor.action]}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${ACTION_COLORS[investor.action]}`}>
                ${investor.amount.toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-500">{investor.action === 'withdrawn' ? 'profit pulled' : 'market move'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

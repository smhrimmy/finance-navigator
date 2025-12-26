import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Account } from '@/types/finance';
import { formatCurrency, formatCompactCurrency } from '@/lib/currencies';

interface NetWorthCardProps {
  accounts: Account[];
  currency: string;
}

// Generate sample net worth history
const generateNetWorthHistory = () => {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let netWorth = 95000;
  
  return months.map((month) => {
    netWorth += Math.random() * 8000 - 2000;
    return {
      month,
      netWorth: Math.round(netWorth),
      assets: Math.round(netWorth * 1.3),
      liabilities: Math.round(netWorth * 0.3),
    };
  });
};

export default function NetWorthCard({ accounts, currency }: NetWorthCardProps) {
  const data = generateNetWorthHistory();
  const currentNetWorth = data[data.length - 1].netWorth;
  const previousNetWorth = data[data.length - 2].netWorth;
  const change = currentNetWorth - previousNetWorth;
  const changePercent = ((change / previousNetWorth) * 100).toFixed(1);
  const isPositive = change >= 0;

  const totalAssets = accounts
    .filter(a => ['checking', 'savings', 'investment', 'crypto', 'cash'].includes(a.type))
    .reduce((sum, a) => sum + a.balance, 0);
  
  const totalLiabilities = accounts
    .filter(a => ['credit', 'loan'].includes(a.type))
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  return (
    <div className="finance-card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Net Worth</h3>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl font-bold font-mono">
              {formatCurrency(currentNetWorth, currency)}
            </span>
            <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-finance-positive' : 'text-finance-negative'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isPositive ? '+' : ''}{formatCompactCurrency(change, currency)} ({changePercent}%)
            </span>
          </div>
        </div>
        <button className="btn-ghost text-sm">
          Details
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 rounded-xl bg-accent/50">
          <p className="text-xs text-muted-foreground">Total Assets</p>
          <p className="text-lg font-semibold font-mono text-finance-positive mt-0.5">
            {formatCompactCurrency(totalAssets, currency)}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-accent/50">
          <p className="text-xs text-muted-foreground">Total Liabilities</p>
          <p className="text-lg font-semibold font-mono text-finance-negative mt-0.5">
            {formatCompactCurrency(totalLiabilities, currency)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              hide 
              domain={['dataMin - 5000', 'dataMax + 5000']}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium">{payload[0].payload.month}</p>
                      <p className="text-lg font-bold font-mono text-primary">
                        {formatCurrency(payload[0].value as number, currency)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#netWorthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

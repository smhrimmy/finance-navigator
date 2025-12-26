import React from 'react';
import { motion } from 'framer-motion';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Transaction } from '@/types/finance';
import { formatCurrency } from '@/lib/currencies';

interface CashFlowCardProps {
  transactions: Transaction[];
  currency: string;
}

// Generate sample cash flow data
const generateCashFlowData = () => {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((month) => ({
    month,
    income: Math.round(5000 + Math.random() * 2000),
    expenses: Math.round(3000 + Math.random() * 1500),
  }));
};

export default function CashFlowCard({ transactions, currency }: CashFlowCardProps) {
  const data = generateCashFlowData();
  
  const currentMonth = data[data.length - 1];
  const netCashFlow = currentMonth.income - currentMonth.expenses;

  return (
    <div className="finance-card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Cash Flow</h3>
          <p className="text-sm text-muted-foreground mt-1">Income vs Expenses over time</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-finance-positive" />
            <span className="text-sm text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-finance-negative" />
            <span className="text-sm text-muted-foreground">Expenses</span>
          </div>
        </div>
      </div>

      {/* Net Cash Flow Highlight */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">This Month's Net</p>
          <p className={`text-xl font-bold font-mono ${netCashFlow >= 0 ? 'text-finance-positive' : 'text-finance-negative'}`}>
            {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow, currency)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm">
            <span className="text-finance-positive font-medium">{formatCurrency(currentMonth.income, currency)}</span>
            <span className="text-muted-foreground"> in</span>
          </p>
          <p className="text-sm">
            <span className="text-finance-negative font-medium">{formatCurrency(currentMonth.expenses, currency)}</span>
            <span className="text-muted-foreground"> out</span>
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={2}>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis hide />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const income = payload.find(p => p.dataKey === 'income')?.value as number;
                  const expenses = payload.find(p => p.dataKey === 'expenses')?.value as number;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium mb-2">{label}</p>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="text-finance-positive">Income: </span>
                          <span className="font-mono">{formatCurrency(income, currency)}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-finance-negative">Expenses: </span>
                          <span className="font-mono">{formatCurrency(expenses, currency)}</span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="income" radius={[4, 4, 0, 0]} fill="hsl(var(--finance-positive))" />
            <Bar dataKey="expenses" radius={[4, 4, 0, 0]} fill="hsl(var(--finance-negative))" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

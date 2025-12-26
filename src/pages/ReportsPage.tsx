import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { sampleTransactions, sampleBudgets } from '@/lib/sampleData';
import { defaultCategories, getCategoryById, getCategoryColor, getCategoryIcon } from '@/lib/categories';
import { formatCurrency, formatCompactCurrency } from '@/lib/currencies';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, isWithinInterval } from 'date-fns';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

type ReportPeriod = 'this-month' | 'last-month' | 'this-year' | 'last-year' | 'custom';

const CHART_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4', '#6366F1'];

export default function ReportsPage() {
  const { currency } = useFinance();
  const { toast } = useToast();
  const [period, setPeriod] = useState<ReportPeriod>('this-month');
  const transactions = sampleTransactions;

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (period) {
      case 'this-month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last-month': {
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      }
      case 'this-year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'last-year': {
        const lastYear = new Date(now.getFullYear() - 1, 0, 1);
        return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
      }
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [period]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => 
      isWithinInterval(new Date(tx.date), { start: dateRange.start, end: dateRange.end })
    );
  }, [transactions, dateRange]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = filteredTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const netSavings = income - expenses;
    const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;
    
    return { income, expenses, netSavings, savingsRate };
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    const expenseByCategory: Record<string, number> = {};
    
    filteredTransactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const cat = tx.category || 'other';
        expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Math.abs(tx.amount);
      });
    
    return Object.entries(expenseByCategory)
      .map(([category, amount]) => ({
        name: getCategoryById(category)?.name || category,
        value: amount,
        color: getCategoryColor(category),
        icon: getCategoryIcon(category),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4); // Top 4 for the breakdown
  }, [filteredTransactions]);

  const monthlyTrend = useMemo(() => {
    const months: Record<string, { income: number; expenses: number }> = {};
    // Use last 6 months
    const today = new Date();
    for(let i=5; i>=0; i--) {
        const d = subMonths(today, i);
        const key = format(d, 'MMM');
        months[key] = { income: 0, expenses: 0 };
    }

    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if(isWithinInterval(txDate, { start: subMonths(today, 6), end: today })) {
          const monthKey = format(txDate, 'MMM');
          if (months[monthKey]) {
            if (tx.type === 'income') {
                months[monthKey].income += tx.amount;
            } else if (tx.type === 'expense') {
                months[monthKey].expenses += Math.abs(tx.amount);
            }
          }
      }
    });
    
    return Object.entries(months).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }));
  }, [transactions]);

  // Net Worth Simulation
  const netWorthData = useMemo(() => {
      return monthlyTrend.map(m => ({
          name: m.month,
          value: 140000 + m.net // Simulated base + net change
      }));
  }, [monthlyTrend]);
  
  const currentNetWorth = 142392;

  return (
    <div className="p-4 pb-24 md:pb-6 space-y-6 w-full max-w-7xl mx-auto bg-background-light dark:bg-background-dark min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <h1 className="text-xl font-bold tracking-tight">Analytics</h1>
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
                <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                <Download className="w-5 h-5" />
            </Button>
        </div>
      </div>

      {/* Segmented Control */}
      <div className="flex p-1 bg-slate-200 dark:bg-surface-dark rounded-lg">
        {['Month', 'Quarter', 'Year', 'Custom'].map((p) => (
            <button
                key={p}
                onClick={() => setPeriod(p === 'Month' ? 'this-month' : p === 'Year' ? 'this-year' : 'custom')}
                className={cn(
                    "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                    (p === 'Month' && period === 'this-month') || (p === 'Year' && period === 'this-year')
                        ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
            >
                {p}
            </button>
        ))}
      </div>

      {/* Hero: Net Worth */}
      <section className="flex flex-col items-center justify-center py-6">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Net Worth</span>
        <h2 className="text-4xl font-bold tracking-tighter text-slate-900 dark:text-white mb-2">
            {formatCurrency(currentNetWorth, currency)}
        </h2>
        <div className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1 rounded-full">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
            +2.4% <span className="font-normal opacity-80">this month</span>
          </span>
        </div>
      </section>

      {/* AI Insight Chip */}
      <section>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 p-4">
          <div className="flex gap-3">
            <div className="mt-1 min-w-[24px]">
              <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Insight</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Great job! You spent <span className="font-bold text-indigo-500 dark:text-indigo-400">15% less</span> on dining out compared to last month. Your savings rate is up by 3%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Spending Breakdown (Donut) */}
      <section>
        <div className="bg-white dark:bg-card rounded-2xl p-5 shadow-sm border border-border/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Spending Breakdown</h3>
            <button className="text-xs font-medium text-primary hover:text-primary/80">View Details</button>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="w-40 h-40 shrink-0 relative">
               <ResponsiveContainer width="100%" height="100%">
                 <RechartsPie>
                   <Pie
                     data={categoryData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {categoryData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                 </RechartsPie>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
                 <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatCompactCurrency(summary.expenses, currency)}
                 </span>
               </div>
            </div>
            <div className="flex-1 w-full space-y-3">
                {categoryData.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                            <span className="text-sm text-slate-600 dark:text-slate-300">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {formatCompactCurrency(cat.value, currency)}
                            </span>
                            <span className="text-xs text-slate-400 w-8 text-right">
                                {((cat.value / summary.expenses) * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Net Worth Growth (Line Chart) */}
      <section>
        <div className="bg-white dark:bg-card rounded-2xl p-5 shadow-sm border border-border/50">
            <div className="flex flex-col gap-2 mb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Net Worth Growth</h3>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">+$3,400</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">vs. last month</span>
                </div>
            </div>
            <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={netWorthData}>
                        <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                            formatter={(value: number) => [formatCurrency(value, currency), 'Net Worth']}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={3}
                            dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </section>

      {/* Income vs Expenses (Bar Chart) */}
      <section>
        <div className="bg-white dark:bg-card rounded-2xl p-5 shadow-sm border border-border/50">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6">Income vs Expenses</h3>
            <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrend} barGap={4}>
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                            dy={10}
                        />
                        <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                            formatter={(value: number) => formatCurrency(value, currency)}
                        />
                        <Bar 
                            dataKey="income" 
                            fill="hsl(var(--primary))" 
                            radius={[4, 4, 0, 0]} 
                            barSize={12}
                        />
                        <Bar 
                            dataKey="expenses" 
                            fill="hsl(var(--muted))" 
                            radius={[4, 4, 0, 0]} 
                            barSize={12}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Income</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted"></div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Expenses</span>
                </div>
            </div>
        </div>
      </section>

      {/* Tax Optimization Card */}
      <section>
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 shadow-lg relative overflow-hidden group border border-slate-700">
            <div className="absolute top-0 right-0 p-4">
                <FileText className="text-slate-600 dark:text-slate-700 w-16 h-16 opacity-20 -rotate-12" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Tax Report Ready</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Estimated Tax Liability</h3>
                <p className="text-slate-400 text-sm mb-4">Optimization found <span className="text-white font-semibold">$1,240</span> in potential deductions.</p>
                <button className="w-full bg-white text-slate-900 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                    <Download className="w-5 h-5" />
                    Download Tax Pack (PDF)
                </button>
            </div>
        </div>
      </section>
    </div>
  );
}

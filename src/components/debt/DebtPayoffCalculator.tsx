import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingDown, 
  Zap, 
  Snowflake, 
  Calendar,
  DollarSign,
  Info,
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/currencies';
import { Debt } from '@/types/finance';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface PayoffSchedule {
  month: number;
  date: string;
  debtId: string;
  debtName: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

interface PayoffResult {
  totalMonths: number;
  totalInterest: number;
  totalPaid: number;
  schedule: PayoffSchedule[];
  monthlyData: { month: string; balance: number }[];
  payoffOrder: string[];
}

function calculatePayoff(
  debts: Debt[], 
  extraPayment: number, 
  method: 'avalanche' | 'snowball'
): PayoffResult {
  const sortedDebts = [...debts].sort((a, b) => {
    if (method === 'avalanche') {
      return b.interestRate - a.interestRate;
    } else {
      return a.currentBalance - b.currentBalance;
    }
  });

  const balances = new Map<string, number>();
  debts.forEach(d => balances.set(d.id, d.currentBalance));

  const schedule: PayoffSchedule[] = [];
  const monthlyData: { month: string; balance: number }[] = [];
  const payoffOrder: string[] = [];
  let totalInterest = 0;
  let month = 0;
  const now = new Date();

  while ([...balances.values()].some(b => b > 0) && month < 360) {
    month++;
    const monthDate = new Date(now.getFullYear(), now.getMonth() + month, 1);
    const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    let availableExtra = extraPayment;

    for (const debt of sortedDebts) {
      const balance = balances.get(debt.id) || 0;
      if (balance <= 0) continue;

      const monthlyRate = debt.interestRate / 100 / 12;
      const interest = balance * monthlyRate;
      totalInterest += interest;

      let payment = debt.minimumPayment;
      
      if (sortedDebts.findIndex(d => (balances.get(d.id) || 0) > 0) === sortedDebts.indexOf(debt)) {
        payment += availableExtra;
        availableExtra = 0;
      }

      const principal = Math.min(payment - interest, balance);
      const actualPayment = Math.min(payment, balance + interest);
      const newBalance = Math.max(0, balance - principal);

      balances.set(debt.id, newBalance);

      schedule.push({
        month,
        date: monthLabel,
        debtId: debt.id,
        debtName: debt.name,
        payment: actualPayment,
        principal,
        interest,
        remainingBalance: newBalance,
      });

      if (newBalance === 0 && !payoffOrder.includes(debt.name)) {
        payoffOrder.push(debt.name);
      }
    }

    const totalBalance = [...balances.values()].reduce((sum, b) => sum + b, 0);
    monthlyData.push({ month: monthLabel, balance: totalBalance });
  }

  const totalPaid = debts.reduce((sum, d) => sum + d.currentBalance, 0) + totalInterest;

  return { totalMonths: month, totalInterest, totalPaid, schedule, monthlyData, payoffOrder };
}

export default function DebtPayoffCalculator() {
  const { debts, currency } = useFinance();
  const [extraPayment, setExtraPayment] = useState(200);
  const [selectedMethod, setSelectedMethod] = useState<'avalanche' | 'snowball'>('avalanche');
  const [expandedDebt, setExpandedDebt] = useState<string | null>(null);

  const avalancheResult = useMemo(() => calculatePayoff(debts, extraPayment, 'avalanche'), [debts, extraPayment]);
  const snowballResult = useMemo(() => calculatePayoff(debts, extraPayment, 'snowball'), [debts, extraPayment]);

  const currentResult = selectedMethod === 'avalanche' ? avalancheResult : snowballResult;
  const savingsVsMinimum = useMemo(() => {
    const minimumOnly = calculatePayoff(debts, 0, selectedMethod);
    return minimumOnly.totalInterest - currentResult.totalInterest;
  }, [debts, selectedMethod, currentResult]);

  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);
  const monthlyMinimum = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

  const comparisonData = [
    { 
      name: 'Avalanche', 
      months: avalancheResult.totalMonths, 
      interest: avalancheResult.totalInterest,
      total: avalancheResult.totalPaid
    },
    { 
      name: 'Snowball', 
      months: snowballResult.totalMonths, 
      interest: snowballResult.totalInterest,
      total: snowballResult.totalPaid
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="finance-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-finance-negative/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-finance-negative" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Debt</p>
                <p className="text-xl font-bold text-finance-negative">
                  {formatCurrency(totalDebt, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payoff Time</p>
                <p className="text-xl font-bold">{currentResult.totalMonths} months</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-finance-warning/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-finance-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Interest</p>
                <p className="text-xl font-bold text-finance-warning">
                  {formatCurrency(currentResult.totalInterest, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card bg-gradient-to-br from-finance-positive/10 to-finance-positive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-finance-positive/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-finance-positive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interest Saved</p>
                <p className="text-xl font-bold text-finance-positive">
                  {formatCurrency(savingsVsMinimum, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="finance-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Choose Your Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMethod('avalanche')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedMethod === 'avalanche' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Avalanche Method</h3>
                    <p className="text-xs text-muted-foreground">Highest interest first</p>
                  </div>
                  {selectedMethod === 'avalanche' && (
                    <Badge className="ml-auto bg-primary">Active</Badge>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payoff time:</span>
                    <span className="font-medium">{avalancheResult.totalMonths} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total interest:</span>
                    <span className="font-medium text-finance-warning">
                      {formatCurrency(avalancheResult.totalInterest, currency)}
                    </span>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMethod('snowball')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedMethod === 'snowball' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Snowflake className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Snowball Method</h3>
                    <p className="text-xs text-muted-foreground">Smallest balance first</p>
                  </div>
                  {selectedMethod === 'snowball' && (
                    <Badge className="ml-auto bg-primary">Active</Badge>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payoff time:</span>
                    <span className="font-medium">{snowballResult.totalMonths} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total interest:</span>
                    <span className="font-medium text-finance-warning">
                      {formatCurrency(snowballResult.totalInterest, currency)}
                    </span>
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Extra Payment Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Extra Monthly Payment</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(Math.max(0, Number(e.target.value)))}
                    className="w-24 text-right"
                  />
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="25"
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$250</span>
                <span>$500</span>
                <span>$750</span>
                <span>$1000</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary mb-1">
                  {selectedMethod === 'avalanche' ? 'Avalanche Method' : 'Snowball Method'}
                </p>
                <p className="text-muted-foreground">
                  {selectedMethod === 'avalanche' 
                    ? 'Pays off highest-interest debt first, minimizing total interest paid. Best for mathematical optimization.'
                    : 'Pays off smallest balance first, creating quick wins for motivation. Best for psychological momentum.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payoff Order */}
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payoff Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentResult.payoffOrder.map((name, index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <span className="flex-1 font-medium truncate">{name}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Over Time */}
        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Balance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentResult.monthlyData.slice(0, 48)}>
                  <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--finance-negative))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--finance-negative))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    interval={5}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [formatCurrency(value, currency), 'Balance']}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="hsl(var(--finance-negative))"
                    strokeWidth={2}
                    fill="url(#balanceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Method Comparison */}
        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Method Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => formatCurrency(value, currency)}
                  />
                  <Legend />
                  <Bar dataKey="interest" name="Interest" fill="hsl(var(--finance-warning))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debt Details */}
      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Debt Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {debts.map((debt) => {
            const isExpanded = expandedDebt === debt.id;
            const debtSchedule = currentResult.schedule.filter(s => s.debtId === debt.id);
            const payoffMonth = debtSchedule.findIndex(s => s.remainingBalance === 0) + 1;
            const interestPaid = debtSchedule.reduce((sum, s) => sum + s.interest, 0);
            
            return (
              <motion.div
                key={debt.id}
                layout
                className="rounded-xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => setExpandedDebt(isExpanded ? null : debt.id)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-finance-negative/20 flex items-center justify-center">
                    <span className="text-lg">💳</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium">{debt.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {debt.interestRate}% APR • {debt.lender}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-finance-negative">
                      {formatCurrency(debt.currentBalance, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Payoff: Month {payoffMonth}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 rounded-lg bg-accent/50">
                            <p className="text-xs text-muted-foreground">Min Payment</p>
                            <p className="font-semibold">{formatCurrency(debt.minimumPayment, currency)}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-accent/50">
                            <p className="text-xs text-muted-foreground">Total Interest</p>
                            <p className="font-semibold text-finance-warning">
                              {formatCurrency(interestPaid, currency)}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-accent/50">
                            <p className="text-xs text-muted-foreground">Paid Off In</p>
                            <p className="font-semibold">{payoffMonth} months</p>
                          </div>
                        </div>
                        
                        {/* Mini payment schedule */}
                        <div className="max-h-48 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-card">
                              <tr className="text-left text-muted-foreground">
                                <th className="py-2">Month</th>
                                <th className="py-2 text-right">Payment</th>
                                <th className="py-2 text-right">Principal</th>
                                <th className="py-2 text-right">Interest</th>
                                <th className="py-2 text-right">Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {debtSchedule.slice(0, 12).map((s) => (
                                <tr key={s.month} className="border-t border-border/50">
                                  <td className="py-2">{s.date}</td>
                                  <td className="py-2 text-right">{formatCurrency(s.payment, currency)}</td>
                                  <td className="py-2 text-right text-finance-positive">
                                    {formatCurrency(s.principal, currency)}
                                  </td>
                                  <td className="py-2 text-right text-finance-warning">
                                    {formatCurrency(s.interest, currency)}
                                  </td>
                                  <td className="py-2 text-right">
                                    {formatCurrency(s.remainingBalance, currency)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

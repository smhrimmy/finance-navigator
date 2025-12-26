import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, TrendingDown, Calendar, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/currencies';
import { sampleDebts } from '@/lib/sampleData';
import DebtPayoffCalculator from '@/components/debt/DebtPayoffCalculator';
import { Debt } from '@/types/finance';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const debtTypeLabels: Record<string, string> = {
  credit_card: 'Credit Card',
  personal_loan: 'Personal Loan',
  student_loan: 'Student Loan',
  mortgage: 'Mortgage',
  auto_loan: 'Auto Loan',
  other: 'Other',
};

const debtTypeColors: Record<string, string> = {
  credit_card: 'bg-red-500/20 text-red-500',
  personal_loan: 'bg-orange-500/20 text-orange-500',
  student_loan: 'bg-blue-500/20 text-blue-500',
  mortgage: 'bg-purple-500/20 text-purple-500',
  auto_loan: 'bg-green-500/20 text-green-500',
  other: 'bg-gray-500/20 text-gray-500',
};

export default function DebtPage() {
  const { currency, debts } = useFinance();
  // const debts = sampleDebts; // Removed local sample usage
  
  // React.useEffect(() => {
  //   setDebts(sampleDebts);
  // }, [setDebts]);

  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const avgInterestRate = debts.length > 0 
    ? debts.reduce((sum, d) => sum + d.interestRate, 0) / debts.length 
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Debt Management</h1>
          <p className="text-muted-foreground">Track and pay off your debts strategically</p>
        </div>
        <Button className="gap-2 bg-gradient-primary">
          <Plus className="w-4 h-4" />
          Add Debt
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="finance-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-finance-negative/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-finance-negative" />
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
                <p className="text-sm text-muted-foreground">Monthly Minimum</p>
                <p className="text-xl font-bold">{formatCurrency(totalMinPayment, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-finance-warning/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-finance-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credit Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">720</p>
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-200">Good</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-finance-positive/20 flex items-center justify-center">
                <Percent className="w-5 h-5 text-finance-positive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Debt Free In</p>
                <p className="text-xl font-bold">18 Months</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debt Freedom Progress - "Breaking Chains" */}
      <Card className="finance-card bg-gradient-to-r from-background to-accent/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-primary" />
                Debt Freedom Progress
              </h3>
              <p className="text-sm text-muted-foreground">You've paid off 15% of your total debt!</p>
            </div>
            <span className="text-2xl font-bold text-primary">15%</span>
          </div>
          <div className="relative h-4 w-full bg-secondary rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '15%' }}
               transition={{ duration: 1.5, ease: "easeOut" }}
               className="absolute top-0 left-0 h-full bg-gradient-primary"
             />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-accent/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payoff">Payoff Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Debt List */}
          <Card className="finance-card">
            <CardHeader>
              <CardTitle>Your Debts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {debts.map((debt) => {
                const paidOff = debt.originalAmount - debt.currentBalance;
                const progress = (paidOff / debt.originalAmount) * 100;

                return (
                  <motion.div
                    key={debt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-border hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${debtTypeColors[debt.type]}`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{debt.name}</h4>
                          <p className="text-sm text-muted-foreground">{debt.lender}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-finance-negative">
                          {formatCurrency(debt.currentBalance, currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          of {formatCurrency(debt.originalAmount, currency)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress.toFixed(1)}% paid</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className={debtTypeColors[debt.type]}>
                          {debtTypeLabels[debt.type]}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground">
                        {debt.interestRate}% APR
                      </span>
                      <span className="text-muted-foreground">
                        Min: {formatCurrency(debt.minimumPayment, currency)}/mo
                      </span>
                      <span className="text-muted-foreground ml-auto">
                        Due: {debt.dueDay}th
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payoff">
          <DebtPayoffCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  PiggyBank,
  Calculator,
  Wallet,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign,
  Percent
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, formatCompactCurrency } from '@/lib/currencies';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

const ALLOCATION_COLORS = {
  stocks: '#3B82F6',
  bonds: '#10B981',
  cash: '#F59E0B',
  realestate: '#8B5CF6',
};

type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

const allocationProfiles: Record<RiskProfile, { stocks: number; bonds: number; cash: number; realestate: number }> = {
  conservative: { stocks: 30, bonds: 50, cash: 15, realestate: 5 },
  moderate: { stocks: 60, bonds: 25, cash: 10, realestate: 5 },
  aggressive: { stocks: 80, bonds: 10, cash: 5, realestate: 5 },
};

export default function RetirementPage() {
  const { currency } = useFinance();
  const { toast } = useToast();

  // Calculator inputs
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);
  const [lifeExpectancy, setLifeExpectancy] = useState(90);
  const [currentSavings, setCurrentSavings] = useState(150000);
  const [monthlyContribution, setMonthlyContribution] = useState(1500);
  const [desiredMonthlyIncome, setDesiredMonthlyIncome] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [inflationRate, setInflationRate] = useState(3);
  const [socialSecurityEstimate, setSocialSecurityEstimate] = useState(2000);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('moderate');

  // Calculations
  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;
  const realReturnRate = (1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1;
  
  const projectedSavings = useMemo(() => {
    let balance = currentSavings;
    const monthlyRate = expectedReturn / 100 / 12;
    const months = yearsToRetirement * 12;
    
    for (let i = 0; i < months; i++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
    }
    return balance;
  }, [currentSavings, monthlyContribution, expectedReturn, yearsToRetirement]);

  const monthlyIncomeGap = desiredMonthlyIncome - socialSecurityEstimate;
  const requiredNestEgg = monthlyIncomeGap * 12 * yearsInRetirement;
  const onTrack = projectedSavings >= requiredNestEgg;
  const percentageToGoal = Math.min((projectedSavings / requiredNestEgg) * 100, 100);

  const requiredMonthlyContribution = useMemo(() => {
    const targetBalance = requiredNestEgg;
    const monthlyRate = expectedReturn / 100 / 12;
    const months = yearsToRetirement * 12;
    
    // Future value of current savings
    const fvCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, months);
    const remainingNeeded = targetBalance - fvCurrentSavings;
    
    if (remainingNeeded <= 0) return 0;
    
    // PMT formula
    const payment = remainingNeeded * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.max(0, payment);
  }, [currentSavings, requiredNestEgg, expectedReturn, yearsToRetirement]);

  // Projection data for chart
  const projectionData = useMemo(() => {
    const data = [];
    let balance = currentSavings;
    const monthlyRate = expectedReturn / 100 / 12;
    
    for (let year = 0; year <= yearsToRetirement + yearsInRetirement; year++) {
      const age = currentAge + year;
      const isRetired = age >= retirementAge;
      
      if (!isRetired) {
        // Accumulation phase
        for (let month = 0; month < 12; month++) {
          balance = balance * (1 + monthlyRate) + monthlyContribution;
        }
      } else {
        // Withdrawal phase
        const annualWithdrawal = monthlyIncomeGap * 12;
        balance = balance * (1 + expectedReturn / 100) - annualWithdrawal;
        balance = Math.max(0, balance);
      }
      
      data.push({
        age,
        balance: Math.round(balance),
        phase: isRetired ? 'Retirement' : 'Accumulation',
      });
    }
    return data;
  }, [currentAge, currentSavings, monthlyContribution, expectedReturn, yearsToRetirement, yearsInRetirement, retirementAge, monthlyIncomeGap]);

  const allocation = allocationProfiles[riskProfile];
  const allocationData = [
    { name: 'Stocks', value: allocation.stocks, color: ALLOCATION_COLORS.stocks },
    { name: 'Bonds', value: allocation.bonds, color: ALLOCATION_COLORS.bonds },
    { name: 'Cash', value: allocation.cash, color: ALLOCATION_COLORS.cash },
    { name: 'Real Estate', value: allocation.realestate, color: ALLOCATION_COLORS.realestate },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Retirement Planner</h1>
          <p className="text-muted-foreground">Plan for a secure financial future</p>
        </div>
        <Badge 
          variant={onTrack ? "default" : "destructive"}
          className={cn("text-base px-4 py-2", onTrack && "bg-chart-2")}
        >
          {onTrack ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              On Track
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Action Needed
            </>
          )}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projected at Retirement</p>
              <p className="text-xl font-bold text-chart-2">{formatCompactCurrency(projectedSavings, currency)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Required Nest Egg</p>
              <p className="text-xl font-bold">{formatCompactCurrency(requiredNestEgg, currency)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Years to Retirement</p>
              <p className="text-xl font-bold">{yearsToRetirement} years</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-5/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-chart-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Income Goal</p>
              <p className="text-xl font-bold">{formatCurrency(desiredMonthlyIncome, currency)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress toward goal */}
      <Card className="finance-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Progress to Retirement Goal</CardTitle>
              <CardDescription>Based on current savings and contribution rate</CardDescription>
            </div>
            <span className="text-2xl font-bold">{percentageToGoal.toFixed(0)}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={percentageToGoal} className="h-4" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Current: {formatCompactCurrency(currentSavings, currency)}</span>
            <span>Goal: {formatCompactCurrency(requiredNestEgg, currency)}</span>
          </div>
          
          {!onTrack && (
            <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Increase your monthly contribution</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    To reach your goal, consider increasing your monthly savings to{' '}
                    <span className="font-semibold text-foreground">
                      {formatCurrency(requiredMonthlyContribution, currency)}/month
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="projection">Projection</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
        </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="finance-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Current Age</Label>
                      <span className="font-mono text-sm">{currentAge} years</span>
                    </div>
                    <Slider 
                      value={[currentAge]} 
                      onValueChange={([v]) => setCurrentAge(v)}
                      min={18}
                      max={70}
                      step={1}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Retirement Age</Label>
                      <span className="font-mono text-sm">{retirementAge} years</span>
                    </div>
                    <Slider 
                      value={[retirementAge]} 
                      onValueChange={([v]) => setRetirementAge(v)}
                      min={50}
                      max={80}
                      step={1}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Life Expectancy</Label>
                      <span className="font-mono text-sm">{lifeExpectancy} years</span>
                    </div>
                    <Slider 
                      value={[lifeExpectancy]} 
                      onValueChange={([v]) => setLifeExpectancy(v)}
                      min={70}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="finance-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Savings</Label>
                    <Input 
                      type="number"
                      value={currentSavings}
                      onChange={(e) => setCurrentSavings(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Contribution</Label>
                    <Input 
                      type="number"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Desired Monthly Income</Label>
                    <Input 
                      type="number"
                      value={desiredMonthlyIncome}
                      onChange={(e) => setDesiredMonthlyIncome(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Social Security Estimate</Label>
                    <Input 
                      type="number"
                      value={socialSecurityEstimate}
                      onChange={(e) => setSocialSecurityEstimate(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Expected Return</Label>
                      <span className="font-mono text-sm">{expectedReturn}%</span>
                    </div>
                    <Slider 
                      value={[expectedReturn]} 
                      onValueChange={([v]) => setExpectedReturn(v)}
                      min={1}
                      max={12}
                      step={0.5}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Inflation Rate</Label>
                      <span className="font-mono text-sm">{inflationRate}%</span>
                    </div>
                    <Slider 
                      value={[inflationRate]} 
                      onValueChange={([v]) => setInflationRate(v)}
                      min={1}
                      max={6}
                      step={0.5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projection Tab */}
        <TabsContent value="projection">
          <Card className="finance-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Retirement Projection
              </CardTitle>
              <CardDescription>
                Your projected savings over time through accumulation and retirement phases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData}>
                    <defs>
                      <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="age" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                      fontSize={12}
                      label={{ value: 'Age', position: 'bottom', fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                      fontSize={12}
                      tickFormatter={(value) => formatCompactCurrency(value, currency)}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatCurrency(value, currency), 'Balance']}
                      labelFormatter={(label) => `Age ${label}`}
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fill="url(#balanceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/30" />
                  <span>Accumulation Phase (Age {currentAge}-{retirementAge})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-chart-4/30" />
                  <span>Retirement Phase (Age {retirementAge}+)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allocation Tab */}
        <TabsContent value="allocation">
          <Card className="finance-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                Asset Allocation Suggestion
              </CardTitle>
              <CardDescription>
                Recommended portfolio allocation based on your risk profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3 space-y-4">
                  <Label className="text-base">Risk Profile</Label>
                  <div className="space-y-2">
                    {(['conservative', 'moderate', 'aggressive'] as RiskProfile[]).map((profile) => (
                      <motion.button
                        key={profile}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setRiskProfile(profile)}
                        className={cn(
                          "w-full p-4 rounded-xl text-left transition-all",
                          riskProfile === profile 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-accent/30 hover:bg-accent/50"
                        )}
                      >
                        <p className="font-semibold capitalize">{profile}</p>
                        <p className="text-sm opacity-80">
                          {profile === 'conservative' && 'Lower risk, stable growth'}
                          {profile === 'moderate' && 'Balanced risk and reward'}
                          {profile === 'aggressive' && 'Higher risk, higher potential'}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="lg:w-1/3 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip 
                        formatter={(value: number) => `${value}%`}
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="lg:w-1/3 space-y-4">
                  <Label className="text-base">Allocation Breakdown</Label>
                  {allocationData.map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }} 
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-semibold">{item.value}%</span>
                      </div>
                      <Progress 
                        value={item.value} 
                        className="h-2"
                        style={{ '--progress-color': item.color } as React.CSSProperties}
                      />
                    </div>
                  ))}
                  
                  <div className="mt-6 p-4 rounded-xl bg-accent/30 text-sm space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-finance-warning flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">Rebalancing Reminder</p>
                        <p className="text-muted-foreground">
                          Your current portfolio has drifted 5% from your target allocation. 
                          Consider rebalancing to maintain your risk profile.
                        </p>
                      </div>
                    </div>
                    <div className="h-px bg-border/50" />
                    <p className="text-muted-foreground">
                      <strong>Disclaimer:</strong> This allocation suggestion is for educational purposes only. 
                      Consult a financial advisor before making investment decisions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

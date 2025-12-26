import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  MoreHorizontal,
  Bitcoin,
  Gem,
  BarChart3,
  Coins,
  Building,
  Landmark,
  PiggyBank,
  Wallet,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/currencies';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'crypto' | 'gold' | 'mutual_fund' | 'etf' | 'bonds' | 'real_estate' | 'fixed_deposit' | 'ppf' | 'nps';
  symbol?: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  currency: string;
  lastUpdated: Date;
  platform: string;
}

const investmentTypes = {
  stocks: { label: 'Stocks', icon: BarChart3, color: '#3B82F6' },
  crypto: { label: 'Cryptocurrency', icon: Bitcoin, color: '#F7931A' },
  gold: { label: 'Gold', icon: Coins, color: '#FFD700' },
  mutual_fund: { label: 'Mutual Funds', icon: TrendingUp, color: '#10B981' },
  etf: { label: 'ETFs', icon: BarChart3, color: '#8B5CF6' },
  bonds: { label: 'Bonds', icon: Landmark, color: '#6366F1' },
  real_estate: { label: 'Real Estate', icon: Building, color: '#EC4899' },
  fixed_deposit: { label: 'Fixed Deposit', icon: PiggyBank, color: '#14B8A6' },
  ppf: { label: 'PPF', icon: Landmark, color: '#F59E0B' },
  nps: { label: 'NPS', icon: Wallet, color: '#EF4444' },
};

const sampleInvestments: Investment[] = [
  {
    id: 'inv_1',
    name: 'Apple Inc.',
    type: 'stocks',
    symbol: 'AAPL',
    quantity: 50,
    buyPrice: 150.00,
    currentPrice: 178.50,
    currency: 'USD',
    lastUpdated: new Date(),
    platform: 'Fidelity',
  },
  {
    id: 'inv_2',
    name: 'Bitcoin',
    type: 'crypto',
    symbol: 'BTC',
    quantity: 0.5,
    buyPrice: 35000,
    currentPrice: 42500,
    currency: 'USD',
    lastUpdated: new Date(),
    platform: 'Coinbase',
  },
  {
    id: 'inv_3',
    name: 'Digital Gold',
    type: 'gold',
    quantity: 10,
    buyPrice: 1850,
    currentPrice: 1950,
    currency: 'USD',
    lastUpdated: new Date(),
    platform: 'Goldmoney',
  },
  {
    id: 'inv_4',
    name: 'Vanguard S&P 500',
    type: 'etf',
    symbol: 'VOO',
    quantity: 25,
    buyPrice: 380,
    currentPrice: 425,
    currency: 'USD',
    lastUpdated: new Date(),
    platform: 'Vanguard',
  },
  {
    id: 'inv_5',
    name: 'Tesla Inc.',
    type: 'stocks',
    symbol: 'TSLA',
    quantity: 20,
    buyPrice: 220,
    currentPrice: 245,
    currency: 'USD',
    lastUpdated: new Date(),
    platform: 'Robinhood',
  },
  {
    id: 'inv_6',
    name: 'Ethereum',
    type: 'crypto',
    symbol: 'ETH',
    quantity: 3,
    buyPrice: 1800,
    currentPrice: 2200,
    currency: 'USD',
    lastUpdated: new Date(),
    platform: 'Coinbase',
  },
];

export default function InvestmentAccounts() {
  const { currency } = useFinance();
  const [investments, setInvestments] = useState<Investment[]>(sampleInvestments);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    name: '',
    type: 'stocks' as Investment['type'],
    symbol: '',
    quantity: 0,
    buyPrice: 0,
    currentPrice: 0,
    platform: '',
  });

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.quantity * inv.buyPrice), 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
  const totalGainLoss = totalCurrentValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  // Portfolio allocation by type
  const allocationData = Object.entries(
    investments.reduce((acc, inv) => {
      const value = inv.quantity * inv.currentPrice;
      acc[inv.type] = (acc[inv.type] || 0) + value;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, value]) => ({
    name: investmentTypes[type as keyof typeof investmentTypes]?.label || type,
    value,
    color: investmentTypes[type as keyof typeof investmentTypes]?.color || '#666',
  }));

  const handleAddInvestment = () => {
    const investment: Investment = {
      id: `inv_${Date.now()}`,
      name: newInvestment.name,
      type: newInvestment.type,
      symbol: newInvestment.symbol,
      quantity: newInvestment.quantity,
      buyPrice: newInvestment.buyPrice,
      currentPrice: newInvestment.currentPrice,
      currency: currency,
      lastUpdated: new Date(),
      platform: newInvestment.platform,
    };
    setInvestments([...investments, investment]);
    setAddDialogOpen(false);
    setNewInvestment({
      name: '',
      type: 'stocks',
      symbol: '',
      quantity: 0,
      buyPrice: 0,
      currentPrice: 0,
      platform: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="finance-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-xl font-bold">{formatCurrency(totalInvested, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-finance-positive/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-finance-positive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-xl font-bold">{formatCurrency(totalCurrentValue, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`finance-card ${totalGainLoss >= 0 ? 'bg-gradient-to-br from-finance-positive/10 to-finance-positive/5' : 'bg-gradient-to-br from-finance-negative/10 to-finance-negative/5'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalGainLoss >= 0 ? 'bg-finance-positive/20' : 'bg-finance-negative/20'}`}>
                {totalGainLoss >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-finance-positive" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-finance-negative" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
                <p className={`text-xl font-bold ${totalGainLoss >= 0 ? 'text-finance-positive' : 'text-finance-negative'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalGainLossPercent >= 0 ? 'bg-finance-positive/20' : 'bg-finance-negative/20'}`}>
                <BarChart3 className={`w-5 h-5 ${totalGainLossPercent >= 0 ? 'text-finance-positive' : 'text-finance-negative'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Return %</p>
                <p className={`text-xl font-bold ${totalGainLossPercent >= 0 ? 'text-finance-positive' : 'text-finance-negative'}`}>
                  {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Allocation Chart */}
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Portfolio Allocation</span>
              <Button variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, currency)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Investment Holdings */}
        <Card className="finance-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Holdings</span>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1 bg-gradient-primary">
                    <Plus className="w-4 h-4" />
                    Add Investment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Investment</DialogTitle>
                    <DialogDescription>
                      Add a new investment to track in your portfolio.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Investment Type</Label>
                        <Select
                          value={newInvestment.type}
                          onValueChange={(value) => setNewInvestment({ ...newInvestment, type: value as Investment['type'] })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(investmentTypes).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Platform</Label>
                        <Input
                          placeholder="e.g., Fidelity, Coinbase"
                          value={newInvestment.platform}
                          onChange={(e) => setNewInvestment({ ...newInvestment, platform: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          placeholder="Investment name"
                          value={newInvestment.name}
                          onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Symbol (optional)</Label>
                        <Input
                          placeholder="e.g., AAPL, BTC"
                          value={newInvestment.symbol}
                          onChange={(e) => setNewInvestment({ ...newInvestment, symbol: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newInvestment.quantity || ''}
                          onChange={(e) => setNewInvestment({ ...newInvestment, quantity: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Buy Price</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={newInvestment.buyPrice || ''}
                          onChange={(e) => setNewInvestment({ ...newInvestment, buyPrice: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Current Price</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={newInvestment.currentPrice || ''}
                          onChange={(e) => setNewInvestment({ ...newInvestment, currentPrice: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-primary" onClick={handleAddInvestment}>
                      Add Investment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {investments.map((investment) => {
              const investedValue = investment.quantity * investment.buyPrice;
              const currentValue = investment.quantity * investment.currentPrice;
              const gainLoss = currentValue - investedValue;
              const gainLossPercent = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0;
              const TypeIcon = investmentTypes[investment.type]?.icon || BarChart3;

              return (
                <motion.div
                  key={investment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${investmentTypes[investment.type]?.color}20` }}
                  >
                    <TypeIcon 
                      className="w-5 h-5" 
                      style={{ color: investmentTypes[investment.type]?.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{investment.name}</h4>
                      {investment.symbol && (
                        <Badge variant="secondary" className="text-xs">
                          {investment.symbol}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {investment.quantity} units @ {formatCurrency(investment.currentPrice, currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(currentValue, currency)}</p>
                    <p className={`text-sm ${gainLoss >= 0 ? 'text-finance-positive' : 'text-finance-negative'}`}>
                      {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Buttons */}
      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Quick Add Investment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(investmentTypes).slice(0, 5).map(([key, { label, icon: Icon, color }]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setNewInvestment({ ...newInvestment, type: key as Investment['type'] });
                  setAddDialogOpen(true);
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/50 transition-all"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

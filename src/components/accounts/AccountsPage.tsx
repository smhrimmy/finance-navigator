import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Plus, 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown,
  Building2,
  CreditCard,
  PiggyBank,
  Landmark,
  Bitcoin,
  DollarSign,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/currencies';
import BankConnectionDialog from './BankConnectionDialog';
import InvestmentAccounts from './InvestmentAccounts';
import { Account } from '@/types/finance';
import { sampleAccounts } from '@/lib/sampleData';

const accountTypeIcons: Record<Account['type'], React.ReactNode> = {
  checking: <Building2 className="w-5 h-5" />,
  savings: <PiggyBank className="w-5 h-5" />,
  credit: <CreditCard className="w-5 h-5" />,
  investment: <TrendingUp className="w-5 h-5" />,
  loan: <Landmark className="w-5 h-5" />,
  cash: <DollarSign className="w-5 h-5" />,
  crypto: <Bitcoin className="w-5 h-5" />,
};

const accountTypeColors: Record<Account['type'], string> = {
  checking: 'bg-blue-500/20 text-blue-500',
  savings: 'bg-green-500/20 text-green-500',
  credit: 'bg-red-500/20 text-red-500',
  investment: 'bg-purple-500/20 text-purple-500',
  loan: 'bg-orange-500/20 text-orange-500',
  cash: 'bg-emerald-500/20 text-emerald-500',
  crypto: 'bg-yellow-500/20 text-yellow-500',
};

export default function AccountsPage() {
  const { currency } = useFinance();
  const [accounts] = useState<Account[]>(sampleAccounts);
  const [hideBalances, setHideBalances] = useState(false);

  const totalAssets = accounts
    .filter(a => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);
  
  const totalLiabilities = accounts
    .filter(a => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const netWorth = totalAssets - totalLiabilities;

  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.type]) acc[account.type] = [];
    acc[account.type].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage all your financial accounts in one place</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setHideBalances(!hideBalances)}
          >
            {hideBalances ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {hideBalances ? 'Show' : 'Hide'} Balances
          </Button>
          <BankConnectionDialog />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="finance-card bg-gradient-to-br from-finance-positive/10 to-finance-positive/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold text-finance-positive">
                  {hideBalances ? '••••••' : formatCurrency(totalAssets, currency)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-finance-positive/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-finance-positive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card bg-gradient-to-br from-finance-negative/10 to-finance-negative/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Liabilities</p>
                <p className="text-2xl font-bold text-finance-negative">
                  {hideBalances ? '••••••' : formatCurrency(totalLiabilities, currency)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-finance-negative/20 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-finance-negative" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Worth</p>
                <p className="text-2xl font-bold">
                  {hideBalances ? '••••••' : formatCurrency(netWorth, currency)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-accent/50">
          <TabsTrigger value="all">All Accounts</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Account Groups */}
          {Object.entries(groupedAccounts).map(([type, accs]) => (
            <div key={type} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${accountTypeColors[type as Account['type']]}`}>
                    {accountTypeIcons[type as Account['type']]}
                  </span>
                  {type.replace('_', ' ')} Accounts
                </h3>
                <span className="text-sm text-muted-foreground">
                  {accs.length} account{accs.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accs.map((account) => (
                  <motion.div
                    key={account.id}
                    whileHover={{ y: -2 }}
                    className="finance-card p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ backgroundColor: account.color ? `${account.color}20` : undefined }}
                        >
                          {account.icon || '🏦'}
                        </div>
                        <div>
                          <h4 className="font-medium">{account.name}</h4>
                          <p className="text-sm text-muted-foreground">{account.institution}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p className={`text-xl font-bold ${account.balance < 0 ? 'text-finance-negative' : ''}`}>
                          {hideBalances ? '••••••' : formatCurrency(account.balance, account.currency)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {account.isManual ? (
                          <Badge variant="secondary" className="text-xs">Manual</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs gap-1">
                            <RefreshCw className="w-3 h-3" />
                            Synced
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Add Account Card */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="min-h-[140px] rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">Add {type} account</span>
                </motion.button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="investments">
          <InvestmentAccounts />
        </TabsContent>
      </Tabs>
    </div>
  );
}

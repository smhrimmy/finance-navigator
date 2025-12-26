import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, RefreshCw } from 'lucide-react';
import { Account } from '@/types/finance';
import { formatCurrency } from '@/lib/currencies';
import { cn } from '@/lib/utils';

interface AccountsListProps {
  accounts: Account[];
  currency: string;
}

const accountTypeLabels: Record<string, string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit: 'Credit Card',
  investment: 'Investment',
  loan: 'Loan',
  cash: 'Cash',
  crypto: 'Crypto',
};

export default function AccountsList({ accounts, currency }: AccountsListProps) {
  const sortedAccounts = [...accounts].sort((a, b) => b.balance - a.balance);

  return (
    <div className="finance-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Accounts</h3>
        <button className="btn-ghost text-sm p-1.5">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {sortedAccounts.map((account, index) => {
          const isNegative = account.balance < 0;
          
          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group"
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: `${account.color || '#71717A'}20` }}
              >
                {account.icon || '🏦'}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{account.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {accountTypeLabels[account.type]}
                  </span>
                  {account.institution && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{account.institution}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className={cn(
                  "font-mono font-medium text-sm",
                  isNegative ? "text-finance-negative" : "text-foreground"
                )}>
                  {formatCurrency(account.balance, currency)}
                </p>
                {!account.isManual && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <RefreshCw className="w-3 h-3" />
                    <span>Synced</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <button className="w-full mt-4 btn-ghost text-sm justify-center">
        <Plus className="w-4 h-4" />
        Add Account
      </button>
    </div>
  );
}

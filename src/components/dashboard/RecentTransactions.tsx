import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { formatCurrency } from '@/lib/currencies';
import { getCategoryById } from '@/lib/categories';
import { cn } from '@/lib/utils';

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency: string;
}

export default function RecentTransactions({ transactions, currency }: RecentTransactionsProps) {
  const sortedTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="finance-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <button className="btn-ghost text-sm">
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        {sortedTransactions.map((tx, index) => {
          const category = getCategoryById(tx.category);
          const isIncome = tx.type === 'income';
          const isTransfer = tx.type === 'transfer';
          
          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group"
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: `${category?.color || '#71717A'}20` }}
              >
                {category?.icon || '📦'}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{tx.description}</p>
                  {tx.isRecurring && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-accent rounded">
                      Recurring
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{tx.merchant || category?.name}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-mono font-medium text-sm",
                  isIncome && "text-finance-positive",
                  !isIncome && !isTransfer && "text-foreground",
                  isTransfer && "text-muted-foreground"
                )}>
                  {isIncome && '+'}
                  {!isIncome && !isTransfer && '-'}
                  {formatCurrency(Math.abs(tx.amount), currency)}
                </span>
                {isIncome && <ArrowDownRight className="w-4 h-4 text-finance-positive" />}
                {!isIncome && !isTransfer && <ArrowUpRight className="w-4 h-4 text-muted-foreground" />}
                {isTransfer && <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

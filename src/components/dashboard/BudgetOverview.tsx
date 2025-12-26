import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Budget } from '@/types/finance';
import { formatCurrency } from '@/lib/currencies';
import { getCategoryById } from '@/lib/categories';
import { cn } from '@/lib/utils';

interface BudgetOverviewProps {
  budgets: Budget[];
  currency: string;
}

export default function BudgetOverview({ budgets, currency }: BudgetOverviewProps) {
  const sortedBudgets = [...budgets].sort((a, b) => (b.spent / b.amount) - (a.spent / a.amount));
  const displayBudgets = sortedBudgets.slice(0, 4);

  return (
    <div className="finance-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Budget Overview</h3>
        <button className="btn-ghost text-sm p-1.5">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {displayBudgets.map((budget, index) => {
          const category = getCategoryById(budget.categoryId);
          const percentage = (budget.spent / budget.amount) * 100;
          const isOverBudget = percentage > 100;
          const isNearLimit = percentage >= 90 && !isOverBudget;
          
          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category?.icon || '📦'}</span>
                  <span className="font-medium text-sm">{budget.name}</span>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "font-mono text-sm font-medium",
                    isOverBudget && "text-finance-negative",
                    isNearLimit && "text-finance-warning"
                  )}>
                    {formatCurrency(budget.spent, currency)}
                  </span>
                  <span className="text-muted-foreground text-sm"> / {formatCurrency(budget.amount, currency)}</span>
                </div>
              </div>
              
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentage, 100)}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    "h-full rounded-full transition-colors",
                    isOverBudget ? "bg-finance-negative" : isNearLimit ? "bg-finance-warning" : "bg-primary"
                  )}
                />
              </div>

              {isOverBudget && (
                <p className="text-xs text-finance-negative">
                  Over budget by {formatCurrency(budget.spent - budget.amount, currency)}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      <button className="w-full mt-4 btn-ghost text-sm justify-center">
        View All Budgets
      </button>
    </div>
  );
}

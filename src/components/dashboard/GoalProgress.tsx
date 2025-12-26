import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Target } from 'lucide-react';
import { Goal } from '@/types/finance';
import { formatCurrency, formatCompactCurrency } from '@/lib/currencies';
import { cn } from '@/lib/utils';

interface GoalProgressProps {
  goals: Goal[];
  currency: string;
}

export default function GoalProgress({ goals, currency }: GoalProgressProps) {
  const displayGoals = goals.slice(0, 3);

  return (
    <div className="finance-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Goals</h3>
        <button className="btn-ghost text-sm p-1.5">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {displayGoals.map((goal, index) => {
          const percentage = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.currentAmount;
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-xl bg-accent/30 border border-border/50"
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: `${goal.color}20` }}
                >
                  {goal.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">{goal.name}</p>
                    <span className="text-xs text-muted-foreground ml-2">{percentage.toFixed(0)}%</span>
                  </div>
                  
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.7, delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-muted-foreground">
                      {formatCompactCurrency(goal.currentAmount, currency)} saved
                    </span>
                    <span className="font-mono font-medium">
                      {formatCompactCurrency(remaining, currency)} to go
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button className="w-full mt-4 btn-ghost text-sm justify-center">
        <Target className="w-4 h-4" />
        Add New Goal
      </button>
    </div>
  );
}

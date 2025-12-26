import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Lightbulb, X, Check } from 'lucide-react';
import { AIRecommendation } from '@/types/finance';
import { cn } from '@/lib/utils';

interface AIInsightsProps {
  recommendations: AIRecommendation[];
}

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-finance-warning/10 text-finance-warning',
  high: 'bg-finance-negative/10 text-finance-negative',
  urgent: 'bg-finance-negative/20 text-finance-negative',
};

const typeIcons: Record<string, string> = {
  budget: '📊',
  savings: '💰',
  debt: '💳',
  tax: '📋',
  investment: '📈',
  insurance: '🛡️',
  general: '💡',
};

export default function AIInsights({ recommendations }: AIInsightsProps) {
  const activeRecommendations = recommendations.filter(r => !r.dismissed).slice(0, 2);

  return (
    <div className="finance-card border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">AI Insights</h3>
          <p className="text-xs text-muted-foreground">Personalized recommendations</p>
        </div>
      </div>

      <div className="space-y-3">
        {activeRecommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-xl bg-accent/30 border border-border/50 group hover:border-primary/30 transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">{typeIcons[rec.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{rec.title}</p>
                  <span className={cn(
                    "px-1.5 py-0.5 text-[10px] font-medium rounded",
                    priorityColors[rec.priority]
                  )}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {rec.description}
                </p>
                
                {/* Confidence Score */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${rec.confidenceScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{rec.confidenceScore}% confidence</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
              <button className="flex-1 btn-ghost text-xs py-1.5">
                <Lightbulb className="w-3 h-3" />
                Learn More
              </button>
              <button className="btn-ghost text-xs py-1.5 text-finance-positive">
                <Check className="w-3 h-3" />
                Apply
              </button>
              <button className="btn-ghost text-xs py-1.5 px-2">
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-4 btn-ghost text-sm justify-center text-primary">
        <Sparkles className="w-4 h-4" />
        Talk to AI Coach
      </button>
    </div>
  );
}

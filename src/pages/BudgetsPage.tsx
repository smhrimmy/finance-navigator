import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  Bell, 
  Settings, 
  ChevronRight,
  Wallet,
  ArrowDownRight,
  Repeat,
  Edit2,
  Trash2,
  Check,
  X,
  Calendar,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  List
} from 'lucide-react';
import { Budget } from '@/types/finance';
import { sampleBudgets } from '@/lib/sampleData';
import { defaultCategories, getCategoryById, getCategoryIcon, getCategoryColor } from '@/lib/categories';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, formatCompactCurrency } from '@/lib/currencies';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function EnvelopeCard({ 
  budget, 
  currency, 
  onEdit,
  onDelete 
}: { 
  budget: Budget; 
  currency: string;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}) {
  const percentage = (budget.spent / budget.amount) * 100;
  const remaining = budget.amount - budget.spent;
  const isOverBudget = percentage > 100;
  
  const category = getCategoryById(budget.categoryId);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="finance-card p-4 group"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: `${getCategoryColor(budget.categoryId)}20` }}
        >
          {getCategoryIcon(budget.categoryId)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-base truncate">{budget.name}</h3>
            <div className="text-right">
              <span className={cn(
                "font-bold",
                isOverBudget ? "text-finance-negative" : "text-foreground"
              )}>
                {formatCurrency(budget.spent, currency)}
              </span>
              <span className="text-muted-foreground text-sm"> / {formatCurrency(budget.amount, currency)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs mb-3">
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                isOverBudget ? "bg-finance-negative" : "bg-finance-positive"
              )} />
              <span className={cn(
                isOverBudget ? "text-finance-negative" : "text-muted-foreground"
              )}>
                {isOverBudget ? "Over Budget" : "On Track"}
              </span>
            </div>
            <span className={cn(
               isOverBudget ? "text-finance-negative font-medium" : "text-muted-foreground"
            )}>
              {isOverBudget 
                ? `${formatCurrency(Math.abs(remaining), currency)} Over` 
                : `${formatCurrency(remaining, currency)} Left`
              }
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn(
                "h-full rounded-full",
                isOverBudget ? "bg-finance-negative" : "bg-finance-positive"
              )}
            />
          </div>

          {/* Action Button (only if over budget) */}
          {isOverBudget && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-8 text-xs bg-finance-negative/5 border-finance-negative/20 hover:bg-finance-negative/10 text-finance-negative hover:text-finance-negative"
            >
              Cover overspending
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function BudgetDialog({ 
  open, 
  onOpenChange, 
  budget, 
  onSave,
  currency 
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget;
  onSave: (budget: Budget) => void;
  currency: string;
}) {
  const [name, setName] = useState(budget?.name || '');
  const [amount, setAmount] = useState(budget?.amount?.toString() || '');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>(budget?.period || 'monthly');
  const [categoryId, setCategoryId] = useState(budget?.categoryId || '');
  const [rollover, setRollover] = useState(budget?.rollover || false);

  const expenseCategories = defaultCategories.filter(c => c.type === 'expense');

  const handleSave = () => {
    const newBudget: Budget = {
      id: budget?.id || `budget_${Date.now()}`,
      name: name || getCategoryById(categoryId)?.name || 'Budget',
      amount: parseFloat(amount) || 0,
      spent: budget?.spent || 0,
      period,
      categoryId,
      rollover,
      alerts: budget?.alerts || { at50: false, at75: true, at90: true, atLimit: true },
    };
    onSave(newBudget);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{budget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Budget Name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder={getCategoryById(categoryId)?.name || 'e.g., Groceries'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input 
                type="number"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500"
              />
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={period} onValueChange={(v: 'weekly' | 'monthly' | 'yearly') => setPeriod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
            <div>
              <Label>Rollover unused budget</Label>
              <p className="text-xs text-muted-foreground">Carry unused amount to next period</p>
            </div>
            <Switch checked={rollover} onCheckedChange={setRollover} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>
            {budget ? 'Save Changes' : 'Create Budget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BudgetsPage() {
  const { currency, budgets, setBudgets, addBudget, updateBudget, deleteBudget } = useFinance();
  const { toast } = useToast();
  // const [budgets, setBudgets] = useState<Budget[]>(sampleBudgets); // Removed local state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [viewMode, setViewMode] = useState<'envelope' | 'zero-based'>('envelope');

  const summary = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const income = 4200; // Mock income
    const unassigned = 0; // Mock unassigned
    
    return { totalBudget, totalSpent, income, unassigned };
  }, [budgets]);

  const handleSaveBudget = (budget: Budget) => {
    if (editingBudget) {
      updateBudget(budget);
      toast({ title: 'Budget updated', description: 'Your budget has been updated successfully.' });
    } else {
      addBudget(budget);
      toast({ title: 'Budget created', description: 'Your new budget has been set up.' });
    }
    setDialogOpen(false);
    setEditingBudget(undefined);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setDialogOpen(true);
  };

  const handleDeleteBudget = (id: string) => {
    deleteBudget(id);
    toast({ title: 'Budget deleted', description: 'The budget has been removed.' });
  };

  const handleNewBudget = () => {
    setEditingBudget(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="max-w-md mx-auto w-full pb-24 md:pb-8 p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowRight className="w-4 h-4 rotate-180" />
        </Button>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors">
          <span className="font-semibold">October 2023</span>
          <span className="text-xs text-primary font-medium">Monthly Plan ▾</span>
        </div>
        <Button variant="ghost" size="icon">
          <Calendar className="w-5 h-5" />
        </Button>
      </div>

      {/* View Toggle */}
      <div className="bg-muted/50 p-1 rounded-xl grid grid-cols-2 gap-1">
        <button 
          onClick={() => setViewMode('envelope')}
          className={cn(
            "py-1.5 text-sm font-medium rounded-lg transition-all",
            viewMode === 'envelope' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Envelope View
        </button>
        <button 
          onClick={() => setViewMode('zero-based')}
          className={cn(
            "py-1.5 text-sm font-medium rounded-lg transition-all",
            viewMode === 'zero-based' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Zero-Based
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="finance-card p-4 bg-background border-border/50">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Wallet className="w-4 h-4 text-finance-positive" />
            <span className="text-xs font-medium uppercase tracking-wider">Income</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(summary.income, currency)}</p>
        </div>
        <div className="finance-card p-4 bg-background border-border/50">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider">Unassigned</span>
          </div>
          <p className="text-2xl font-bold text-primary">{formatCurrency(summary.unassigned, currency)}</p>
        </div>
      </div>

      {/* AI Alert */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1A2333] border border-blue-900/50 p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
        
        <div className="relative z-10">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Income Change Detected</h3>
              <p className="text-xs text-blue-200/70 mt-1 leading-relaxed">
                Income increased by $200. Our AI can redistribute this to your "Savings" goal automatically.
              </p>
            </div>
          </div>
          
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none h-9 text-xs font-medium">
            AUTO-ADJUST BUDGETS
            <ArrowRight className="w-3 h-3 ml-2" />
          </Button>
        </div>
      </div>

      {/* Total Budget Progress */}
      <div className="finance-card p-5">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Budget Used</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">78%</span>
              <span className="text-sm text-muted-foreground">of {formatCurrency(summary.totalBudget, currency)}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{formatCurrency(summary.totalSpent, currency)} Spent</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(summary.totalBudget - summary.totalSpent, currency)} Remaining</p>
          </div>
        </div>

        <div className="h-3 flex rounded-full overflow-hidden bg-muted">
          <div className="w-[45%] bg-blue-500" />
          <div className="w-[20%] bg-emerald-500" />
          <div className="w-[13%] bg-purple-500" />
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Housing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Food</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Transport</span>
          </div>
        </div>
      </div>

      {/* Categories Header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-bold">Categories</h2>
        <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 gap-1 h-8" onClick={handleNewBudget}>
          <Plus className="w-4 h-4" />
          New
        </Button>
      </div>

      {/* Budgets List */}
      <div className="space-y-3">
        <AnimatePresence>
          {budgets.map((budget, index) => (
            <EnvelopeCard
              key={budget.id}
              budget={budget}
              currency={currency}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {budgets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="finance-card text-center py-12"
        >
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first budget envelope to start tracking spending
          </p>
          <Button onClick={handleNewBudget}>
            <Plus className="w-4 h-4 mr-2" />
            Create Budget
          </Button>
        </motion.div>
      )}

      {/* Budget Dialog */}
      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        budget={editingBudget}
        onSave={handleSaveBudget}
        currency={currency}
      />
    </div>
  );
}

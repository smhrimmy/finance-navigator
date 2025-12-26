import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Target, 
  Calendar, 
  TrendingUp,
  Trophy,
  Sparkles,
  ChevronRight,
  Edit2,
  Trash2,
  Repeat,
  Clock,
  Check,
  PartyPopper,
  Star,
  Bell,
  Shield,
  Plane,
  Home,
  ArrowRight,
  Info
} from 'lucide-react';
import { Goal } from '@/types/finance';
import { sampleGoals } from '@/lib/sampleData';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, formatCompactCurrency } from '@/lib/currencies';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { format, differenceInDays, differenceInMonths } from 'date-fns';

const GOAL_ICONS = ['🎯', '🏠', '🚗', '✈️', '💻', '📚', '💍', '🎓', '🏖️', '💰', '🛡️', '📈', '🎁', '👶', '🏋️'];
const GOAL_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4', '#6366F1'];

interface CircularProgressProps {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

function CircularProgress({ percentage, color, size = 60, strokeWidth = 5, children }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
        {children || `${Math.round(percentage)}%`}
      </div>
    </div>
  );
}

function GoalCard({ 
  goal, 
  currency, 
  onEdit,
  onDelete,
  onContribute
}: { 
  goal: Goal; 
  currency: string;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onContribute: (goal: Goal, amount: number) => void;
}) {
  const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = goal.targetAmount - goal.currentAmount;
  
  // Custom styling based on goal type/name for demo purposes
  const isEmergency = goal.name.includes('Emergency');
  const isRetirement = goal.name.includes('Retirement');
  const isTrip = goal.name.includes('Trip');
  const isHouse = goal.name.includes('Payment') || goal.name.includes('House');

  if (isHouse) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl h-40 group cursor-pointer"
        onClick={() => onEdit(goal)}
      >
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        
        <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">{goal.name}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-white/80 mb-2">
              <span>Target: {formatCurrency(goal.targetAmount, currency)} • Due 2026</span>
              <span>{percentage.toFixed(0)}%</span>
            </div>
            <Progress value={percentage} className="h-1.5 bg-white/20 [&>div]:bg-blue-500" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="finance-card p-5 relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            {isEmergency ? <Shield className="w-6 h-6" style={{ color: goal.color }} /> :
             isRetirement ? <TrendingUp className="w-6 h-6" style={{ color: goal.color }} /> :
             isTrip ? <Plane className="w-6 h-6" style={{ color: goal.color }} /> :
             goal.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{goal.name}</h3>
            <p className="text-sm text-muted-foreground">
              {isEmergency ? 'Salary tier' : isTrip ? 'Travel & Leisure' : '401k / Roth'}
            </p>
          </div>
        </div>
        
        <Badge 
          variant="outline" 
          className={cn(
            "border-0 px-2 py-0.5 text-xs font-medium",
            isTrip ? "bg-yellow-500/10 text-yellow-500" :
            isRetirement ? "bg-purple-500/10 text-purple-500" :
            "bg-emerald-500/10 text-emerald-500"
          )}
        >
          {isTrip ? 'At Risk' : isRetirement ? 'Tax Optimized' : 'On Track'}
        </Badge>
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{formatCompactCurrency(goal.currentAmount, currency)}</span>
            <span className="text-muted-foreground text-sm">/ {formatCompactCurrency(goal.targetAmount, currency)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isEmergency ? 'Saved over 12 months' : goal.deadline ? `Due ${format(new Date(goal.deadline), 'MMM yyyy')}` : 'Long term'}
          </p>
        </div>
        
        <CircularProgress percentage={percentage} color={goal.color} size={50}>
          {percentage.toFixed(0)}%
        </CircularProgress>
      </div>

      {isEmergency && (
        <div className="bg-accent/30 rounded-lg p-3 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-4 h-4 shrink-0 text-blue-500" />
          <p>High-yield tip: Move to a 4.5% APY account to reach goal 2 months earlier.</p>
        </div>
      )}
    </motion.div>
  );
}

function GoalDialog({ 
  open, 
  onOpenChange, 
  goal, 
  onSave,
  currency 
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal;
  onSave: (goal: Goal) => void;
  currency: string;
}) {
  const [name, setName] = useState(goal?.name || '');
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount?.toString() || '');
  const [currentAmount, setCurrentAmount] = useState(goal?.currentAmount?.toString() || '0');
  const [icon, setIcon] = useState(goal?.icon || '🎯');
  const [color, setColor] = useState(goal?.color || GOAL_COLORS[0]);

  const handleSave = () => {
    const newGoal: Goal = {
      id: goal?.id || `goal_${Date.now()}`,
      name,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      deadline: goal?.deadline,
      icon,
      color,
      type: goal?.type || 'savings',
      priority: goal?.priority || 'medium',
    };
    onSave(newGoal);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Goal Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Amount</Label>
              <Input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Current Amount</Label>
              <Input type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function GoalsPage() {
  const { currency, goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const { toast } = useToast();
  // const [goals, setGoals] = useState<Goal[]>(sampleGoals); // Removed local state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();

  const summary = useMemo(() => {
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const completedCount = goals.filter(g => g.currentAmount >= g.targetAmount).length;
    
    return { totalTarget, totalSaved, completedCount };
  }, [goals]);

  const handleSaveGoal = (goal: Goal) => {
    if (goals.some(g => g.id === goal.id)) {
      updateGoal(goal);
      toast({ title: 'Goal updated', description: 'Your goal has been updated successfully.' });
    } else {
      addGoal(goal);
      toast({ title: 'Goal created', description: 'Your new goal has been set up.' });
    }
    setEditingGoal(undefined);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setDialogOpen(true);
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
    toast({ title: 'Goal deleted', description: 'The goal has been removed.' });
  };

  const handleNewGoal = () => {
    setEditingGoal(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="max-w-md mx-auto w-full pb-24 md:pb-8 p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold">Financial Targets</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="w-5 h-5" />
          </Button>
          <Button size="icon" className="rounded-full h-8 w-8 bg-blue-600 hover:bg-blue-700" onClick={handleNewGoal}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="finance-card p-4">
          <div className="flex items-start gap-2 mb-2 text-muted-foreground">
            <Target className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Saved</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(summary.totalSaved, currency)}</p>
          <p className="text-xs text-finance-positive mt-1 font-medium">+12% this month</p>
        </div>
        <div className="finance-card p-4">
          <div className="flex items-start gap-2 mb-2 text-muted-foreground">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Goals Active</span>
          </div>
          <p className="text-2xl font-bold">{goals.length}</p>
          <p className="text-xs text-blue-400 mt-1 font-medium">2 nearing completion</p>
        </div>
      </div>

      {/* AI Smart Tip */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1e1b4b] border border-indigo-500/30 p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
        
        <div className="relative z-10">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-sm">AI Smart Tip</h3>
              <p className="text-xs text-indigo-200/70 mt-1 leading-relaxed">
                Based on your spending, you can increase your <span className="text-white font-medium">Emergency Fund</span> contribution by <span className="text-green-400 font-medium">$150/mo</span> without impacting your lifestyle.
              </p>
            </div>
            <Button variant="link" className="text-indigo-400 text-xs px-0 h-auto">Apply</Button>
          </div>
        </div>
      </div>

      {/* Active Goals Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Active Goals</h2>
          <Button variant="link" className="text-blue-500 text-xs h-auto px-0">View All</Button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                currency={currency}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onContribute={(g, a) => handleSaveGoal({...g, currentAmount: g.currentAmount + a})}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Goal Dialog */}
      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goal={editingGoal}
        onSave={handleSaveGoal}
        currency={currency}
      />
    </div>
  );
}

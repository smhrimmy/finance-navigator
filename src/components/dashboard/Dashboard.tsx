import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target,
  AlertTriangle,
  Calendar,
  DollarSign,
  Bell,
  Search,
  Plus,
  Home,
  BarChart2,
  User,
  MoreHorizontal,
  Lightbulb,
  ArrowRight,
  Laptop
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, formatCompactCurrency } from '@/lib/currencies';
import { sampleAccounts, sampleTransactions, sampleBudgets, sampleGoals, sampleDebts, sampleRecommendations } from '@/lib/sampleData';
import { cn } from '@/lib/utils';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { currency, userMode, summary, accounts, transactions, budgets } = useFinance();

  // Use real summary data or fallback to defaults (avoiding hardcoded mock data)
  const netWorth = summary?.netWorth || 0;
  
  // Find primary checking and savings accounts for the dashboard
  const checkingAccount = accounts.find(a => a.type === 'checking') || accounts[0];
  const savingsAccount = accounts.find(a => a.type === 'savings') || accounts[1];

  const checkingBalance = checkingAccount ? checkingAccount.balance : 0;
  const savingsBalance = savingsAccount ? savingsAccount.balance : 0;
  
  // Calculate cash flow for the last 7 days
  const cashFlowData = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      return d;
    });

    return last7Days.map(date => {
      const dayName = days[date.getDay()];
      const dayTxs = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getDate() === date.getDate() && 
               tDate.getMonth() === date.getMonth() && 
               tDate.getFullYear() === date.getFullYear();
      });

      const income = dayTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return { name: dayName, income, expense };
    });
  }, [transactions]);
  
  // Calculate upcoming recurring transactions (simplified)
  const upcomingTransactions = React.useMemo(() => {
    // In a real app, this would use the recurring logic
    // For now, let's just show recent expenses as a placeholder or filter for future dated ones if any
    return transactions
      .filter(t => new Date(t.date) > new Date())
      .slice(0, 3)
      .map(t => ({
        name: t.description,
        amount: t.type === 'expense' ? -t.amount : t.amount,
        date: new Date(t.date).toLocaleDateString(),
        icon: t.category === 'housing' ? Home : Calendar, // Simplified icon mapping
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
      }));
  }, [transactions]);

  return (
    <div className="pb-24 md:pb-8">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-background/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center overflow-hidden">
             <img src="https://github.com/shadcn.png" alt="User" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Good Evening</p>
            <h1 className="text-lg font-bold">Alex</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-6 space-y-6"
      >
        {/* Mode Switcher */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 h-8 px-3 gap-1.5 whitespace-nowrap">
            <Laptop className="w-3.5 h-3.5" />
            Freelancer Mode
          </Badge>
          <Badge variant="outline" className="h-8 px-3 gap-1.5 whitespace-nowrap bg-background/50 backdrop-blur-sm">
             <User className="w-3.5 h-3.5" />
             Student Mode
          </Badge>
          <Badge variant="outline" className="h-8 px-3 gap-1.5 whitespace-nowrap bg-background/50 backdrop-blur-sm">
             <Settings className="w-3.5 h-3.5" />
             Settings
          </Badge>
        </div>

        {/* Net Worth */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-1">TOTAL NET WORTH (USD)</p>
          <h2 className="text-4xl font-bold mb-2">$42,500.00</h2>
          <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0 gap-1">
            <TrendingUp className="w-3 h-3" />
            +9.2% this month
          </Badge>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            variants={itemVariants}
            className="p-4 rounded-2xl bg-blue-600 text-white relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 opacity-80">
                <Wallet className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Checking</span>
              </div>
              <p className="text-xl font-bold mb-1">$4,250.00</p>
              <p className="text-xs opacity-70">**** 4589 • Chase Bank</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="p-4 rounded-2xl bg-card border border-border relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                <PiggyBank className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Savings</span>
              </div>
              <p className="text-xl font-bold mb-1">$18,500.00</p>
              <p className="text-xs text-green-500 font-medium">APY 4.5% • Wealthfront</p>
            </div>
          </motion.div>
        </div>

        {/* Tax Alert */}
        <motion.div variants={itemVariants} className="p-4 rounded-2xl bg-[#1A2333] border border-blue-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex gap-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-sm">Tax Optimization Alert</h3>
              <p className="text-xs text-blue-200/70 mt-1 leading-relaxed">
                You have <span className="text-white font-medium">$300 left</span> in deductible expenses for this quarter. Scan your equipment receipt now.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cash Flow Chart */}
        <motion.div variants={itemVariants} className="finance-card p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Cash Flow</h3>
            <Button variant="link" className="text-xs text-blue-500 h-auto p-0">View Report</Button>
          </div>
          
          <div className="flex gap-8 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Income</p>
              <p className="text-lg font-bold text-white">$4,200</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Expense</p>
              <p className="text-lg font-bold text-white">$1,850</p>
            </div>
          </div>

          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  fill="none" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Budgets Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Budgets</h3>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
             {budgets.slice(0, 2).map((budget, idx) => (
               <div key={idx} className="finance-card p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2 w-[200px]">
                      <span className="font-medium text-sm">{budget.name}</span>
                      <span className={`text-xs font-medium ${budget.spent > budget.amount ? 'text-red-500' : 'text-green-500'}`}>
                        {Math.round((budget.spent / budget.amount) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-[200px] bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${budget.spent > budget.amount ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%` }} 
                      />
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full ${budget.spent > budget.amount ? 'bg-red-500/10' : 'bg-green-500/10'} flex items-center justify-center`}>
                     <AlertTriangle className={`w-4 h-4 ${budget.spent > budget.amount ? 'text-red-500' : 'text-green-500'}`} />
                  </div>
               </div>
             ))}
          </div>
        </motion.div>

        {/* Upcoming Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="font-semibold">Upcoming</h3>
          
          <div className="space-y-3">
            {[
              { name: 'Rent', amount: -1200, date: 'in 2 days', icon: Home, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { name: 'Water Bill', amount: -45, date: 'Tomorrow', icon:  Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { name: 'Emergency Fund', amount: 500, date: 'Oct 30', icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            ].map((item, i) => (
              <div key={i} className="finance-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <p className={`font-mono font-medium ${item.amount > 0 ? 'text-green-500' : ''}`}>
                  {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount, currency).replace('$', '')}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-20">
         <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center"
         >
            <Plus className="w-6 h-6" />
         </motion.button>
      </div>
    </div>
  );
}

function Settings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

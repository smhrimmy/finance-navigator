/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserProfile, 
  UserMode, 
  Account, 
  Transaction, 
  Budget, 
  Goal, 
  Debt,
  FinancialSummary,
  Notification,
  AIRecommendation
} from '@/types/finance';

interface FinanceContextType {
  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isOnboarding: boolean;
  setIsOnboarding: (value: boolean) => void;
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
  
  // Accounts
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  addAccount: (account: Account) => void;
  
  // Transactions
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addTransaction: (transaction: Transaction) => void;
  
  // Budgets
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  
  // Goals
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  
  // Debts
  debts: Debt[];
  setDebts: React.Dispatch<React.SetStateAction<Debt[]>>;
  addDebt: (debt: Debt) => void;
  updateDebt: (debt: Debt) => void;
  deleteDebt: (id: string) => void;
  
  // Summary
  summary: FinancialSummary;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  
  // AI Recommendations
  recommendations: AIRecommendation[];
  dismissRecommendation: (id: string) => void;
  
  // Auth methods
  login: (token: string, user: UserProfile) => void;
  logout: () => void;

  // Settings
  currency: string;
  setCurrency: (currency: string) => void;
  country: string;
  setCountry: (country: string) => void;
}

const defaultSummary: FinancialSummary = {
  netWorth: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  savingsRate: 0,
  debtToIncomeRatio: 0,
  emergencyFundMonths: 0,
  creditUtilization: 0,
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [userMode, setUserMode] = useState<UserMode>('salaried');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('US');

  // Check if user has completed onboarding and fetch data
  useEffect(() => {
    const fetchMongoData = async () => {
      const savedUser = localStorage.getItem('financeOS_user');
      
      if (!savedUser) {
        // Fallback to local storage if no user logged in (demo mode)
        const savedOnboarding = localStorage.getItem('financeOS_onboarding');
        if (savedOnboarding === 'complete') {
          setIsOnboarding(false);
        }
        return;
      }

      const currentUser = JSON.parse(savedUser);
      const userId = currentUser._id || currentUser.id;

      try {
        const safeJson = async (res: Response) => {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            return await res.json();
          }
          throw new Error("Invalid response type");
        };

        // Fetch User
        const userRes = await fetch(`/api/user?id=${userId}`);
        if (userRes.ok) {
          const { data: profile } = await safeJson(userRes);
          setUser({
            id: profile._id,
            email: profile.email || '',
            name: profile.name || '',
            country: profile.country || 'US',
            currency: profile.currency || 'USD',
            mode: (profile.mode as UserMode) || 'salaried',
            createdAt: new Date(profile.createdAt),
            onboardingComplete: profile.onboardingComplete || false,
            preferences: profile.preferences || { theme: 'dark', language: 'en' }
          });
          setIsOnboarding(!profile.onboardingComplete);
          if (profile.mode) setUserMode(profile.mode as UserMode);
          if (profile.currency) setCurrency(profile.currency);
          if (profile.country) setCountry(profile.country);
        }

        // Fetch Accounts
        const accRes = await fetch(`/api/accounts?userId=${userId}`);
        if (accRes.ok) {
          const { data: accountsData } = await safeJson(accRes);
          setAccounts(accountsData.map((acc: Record<string, any>) => ({
            id: acc._id,
            name: acc.name,
            type: acc.type as Account['type'],
            balance: Number(acc.balance),
            currency: acc.currency || 'USD',
            institution: acc.institution || undefined,
            lastSync: acc.lastSync ? new Date(acc.lastSync) : undefined,
            isManual: acc.isManual || false,
            color: acc.color || undefined,
            icon: acc.icon || undefined
          })));
        }

        // Fetch Transactions
        const txRes = await fetch(`/api/transactions?userId=${userId}`);
        if (txRes.ok) {
          const { data: txData } = await safeJson(txRes);
          setTransactions(txData.map((tx: Record<string, any>) => ({
            id: tx._id,
            accountId: tx.accountId,
            date: new Date(tx.date),
            amount: Number(tx.amount),
            currency: tx.currency || 'USD',
            description: tx.description,
            category: tx.category,
            subcategory: tx.subcategory || undefined,
            type: tx.type as Transaction['type'],
            isRecurring: tx.isRecurring || false,
            tags: tx.tags || [],
            notes: tx.notes || undefined,
            merchant: tx.merchant || undefined,
            location: tx.location || undefined
          })));
        }

        // Fetch Budgets
        const budgetRes = await fetch(`/api/budgets?userId=${userId}`);
        if (budgetRes.ok) {
          const { data: budgetData } = await safeJson(budgetRes);
          setBudgets(budgetData.map((b: Record<string, any>) => ({
            id: b._id,
            name: b.name,
            amount: Number(b.amount),
            spent: Number(b.spent),
            period: b.period as Budget['period'],
            categoryId: b.categoryId,
            rollover: b.rollover || false,
            alerts: b.alerts as Budget['alerts']
          })));
        }

        // Fetch Goals
        const goalRes = await fetch(`/api/goals?userId=${userId}`);
        if (goalRes.ok) {
          const { data: goalData } = await safeJson(goalRes);
          setGoals(goalData.map((g: Record<string, any>) => ({
            id: g._id,
            name: g.name,
            targetAmount: Number(g.targetAmount),
            currentAmount: Number(g.currentAmount),
            deadline: g.deadline ? new Date(g.deadline) : undefined,
            icon: g.icon || '',
            color: g.color || '',
            type: g.type as Goal['type'],
            priority: g.priority as Goal['priority'],
            autoContribute: g.autoContribute as Goal['autoContribute']
          })));
        }

        // Fetch Debts
        const debtRes = await fetch(`/api/debts?userId=${userId}`);
        if (debtRes.ok) {
          const { data: debtData } = await safeJson(debtRes);
          setDebts(debtData.map((d: Record<string, any>) => ({
            id: d._id,
            name: d.name,
            type: d.type as Debt['type'],
            originalAmount: Number(d.originalAmount),
            currentBalance: Number(d.currentBalance),
            interestRate: Number(d.interest_rate),
            minimumPayment: Number(d.minimum_payment),
            dueDay: d.dueDay || 1,
            lender: d.lender || '',
            startDate: new Date(d.startDate || new Date()),
            endDate: d.endDate ? new Date(d.endDate) : undefined
          })));
        }

      } catch (error) {
        console.warn("API unavailable or returned invalid data. Using local/fallback mode.", error);
        // Optional: Set a flag for "Offline Mode"
      }
    };

    fetchMongoData();
  }, []);

  // Calculate financial summary
  const summary: FinancialSummary = React.useMemo(() => {
    const totalAssets = accounts
      .filter(a => ['checking', 'savings', 'investment', 'crypto', 'cash'].includes(a.type))
      .reduce((sum, a) => sum + a.balance, 0);
    
    const totalLiabilities = accounts
      .filter(a => ['credit', 'loan'].includes(a.type))
      .reduce((sum, a) => sum + Math.abs(a.balance), 0) + 
      debts.reduce((sum, d) => sum + d.currentBalance, 0);

    const now = new Date();
    const thisMonth = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    });

    const monthlyIncome = thisMonth.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = thisMonth.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    const debtToIncomeRatio = monthlyIncome > 0 ? (totalLiabilities / (monthlyIncome * 12)) * 100 : 0;
    
    const emergencyFund = accounts.find(a => a.name.toLowerCase().includes('emergency'))?.balance || 0;
    const emergencyFundMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
    
    const creditAccounts = accounts.filter(a => a.type === 'credit');
    const creditUsed = creditAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);
    const creditLimit = creditAccounts.length * 5000; // Placeholder
    const creditUtilization = creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0;

    return {
      netWorth: totalAssets - totalLiabilities,
      totalAssets,
      totalLiabilities,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      debtToIncomeRatio,
      emergencyFundMonths,
      creditUtilization,
    };
  }, [accounts, transactions, debts]);

  const addAccount = async (account: Account) => {
    try {
      const savedUser = localStorage.getItem('financeOS_user');
      if (!savedUser) {
        setAccounts(prev => [...prev, account]);
        return;
      }
      const currentUser = JSON.parse(savedUser);
      const userId = currentUser._id || currentUser.id;

      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: account.name,
          type: account.type,
          balance: account.balance,
          currency: account.currency,
          institution: account.institution,
          isManual: account.isManual,
          color: account.color,
          icon: account.icon
        })
      });

      if (res.ok) {
        const { data } = await res.json();
        setAccounts(prev => [...prev, {
            ...account,
            id: data._id
        }]);
      } else {
        console.error('Error adding account');
      }
    } catch (e) {
      console.error('Error adding account:', e);
      setAccounts(prev => [...prev, account]);
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    try {
      const savedUser = localStorage.getItem('financeOS_user');
      if (!savedUser) {
        setTransactions(prev => [...prev, transaction]);
        return;
      }
      const currentUser = JSON.parse(savedUser);
      const userId = currentUser._id || currentUser.id;

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          accountId: transaction.accountId,
          date: transaction.date,
          amount: transaction.amount,
          currency: transaction.currency,
          description: transaction.description,
          category: transaction.category,
          subcategory: transaction.subcategory,
          type: transaction.type,
          isRecurring: transaction.isRecurring,
          merchant: transaction.merchant,
          notes: transaction.notes,
          tags: transaction.tags
        })
      });

      if (res.ok) {
        const { data } = await res.json();
        setTransactions(prev => [...prev, {
            ...transaction,
            id: data._id
        }]);
      } else {
         console.error('Error adding transaction');
      }
    } catch (e) {
        console.error('Error adding transaction:', e);
        setTransactions(prev => [...prev, transaction]);
    }
  };

  const addBudget = async (budget: Budget) => {
    try {
      const savedUser = localStorage.getItem('financeOS_user');
      if (!savedUser) {
        setBudgets(prev => [...prev, budget]);
        return;
      }
      const currentUser = JSON.parse(savedUser);
      const userId = currentUser._id || currentUser.id;

      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: budget.name,
          amount: budget.amount,
          spent: budget.spent,
          period: budget.period,
          categoryId: budget.categoryId,
          rollover: budget.rollover,
          alerts: budget.alerts
        })
      });

      if (res.ok) {
        const { data } = await res.json();
        setBudgets(prev => [...prev, { ...budget, id: data._id }]);
      } else {
        console.error('Error adding budget');
      }
    } catch (e) {
      console.error('Error adding budget:', e);
      setBudgets(prev => [...prev, budget]);
    }
  };

  const updateBudget = async (budget: Budget) => {
    try {
      const savedUser = localStorage.getItem('financeOS_user');
      if (!savedUser) {
        setBudgets(prev => prev.map(b => b.id === budget.id ? budget : b));
        return;
      }

      const res = await fetch('/api/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: budget.id,
          name: budget.name,
          amount: budget.amount,
          spent: budget.spent,
          period: budget.period,
          categoryId: budget.categoryId,
          rollover: budget.rollover,
          alerts: budget.alerts
        })
      });

      if (res.ok) {
        setBudgets(prev => prev.map(b => b.id === budget.id ? budget : b));
      } else {
        console.error('Error updating budget');
      }
    } catch (e) {
      console.error('Error updating budget:', e);
      setBudgets(prev => prev.map(b => b.id === budget.id ? budget : b));
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const savedUser = localStorage.getItem('financeOS_user');
      if (!savedUser) {
        setBudgets(prev => prev.filter(b => b.id !== id));
        return;
      }

      const res = await fetch(`/api/budgets?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setBudgets(prev => prev.filter(b => b.id !== id));
      } else {
        console.error('Error deleting budget');
      }
    } catch (e) {
      console.error('Error deleting budget:', e);
      setBudgets(prev => prev.filter(b => b.id !== id));
    }
  };

  const addGoal = async (goal: Goal) => {
    try {
      const savedUser = localStorage.getItem('financeOS_user');
      if (!savedUser) {
        setGoals(prev => [...prev, goal]);
        return;
      }
      const currentUser = JSON.parse(savedUser);
      const userId = currentUser._id || currentUser.id;

      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          deadline: goal.deadline,
          icon: goal.icon,
          color: goal.color,
          type: goal.type,
          priority: goal.priority,
          autoContribute: goal.autoContribute
        })
      });

      if (res.ok) {
        const { data } = await res.json();
        setGoals(prev => [...prev, { ...goal, id: data._id }]);
      } else {
        console.error('Error adding goal');
      }
    } catch (e) {
      console.error('Error adding goal:', e);
      setGoals(prev => [...prev, goal]);
    }
  };

  const updateGoal = async (goal: Goal) => {
    try {
      const savedUser = localStorage.getItem('financeOS_user');
      if (!savedUser) {
        setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
        return;
      }

      const res = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: goal.id,
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          deadline: goal.deadline,
          icon: goal.icon,
          color: goal.color,
          type: goal.type,
          priority: goal.priority,
          autoContribute: goal.autoContribute
        })
      });

      if (res.ok) {
        setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
      } else {
        console.error('Error updating goal');
      }
    } catch (e) {
      console.error('Error updating goal:', e);
      setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const savedUser = localStorage.getItem('financeOS_user');
      if (!savedUser) {
        setGoals(prev => prev.filter(g => g.id !== id));
        return;
      }

      const res = await fetch(`/api/goals?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setGoals(prev => prev.filter(g => g.id !== id));
      } else {
        console.error('Error deleting goal');
      }
    } catch (e) {
      console.error('Error deleting goal:', e);
      setGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  const addDebt = async (debt: Debt) => {
    try {
      const savedUser = localStorage.getItem('financeOS_user');
      if (!savedUser) {
        setDebts(prev => [...prev, debt]);
        return;
      }
      const currentUser = JSON.parse(savedUser);
      const userId = currentUser._id || currentUser.id;

      const res = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: debt.name,
          type: debt.type,
          originalAmount: debt.originalAmount,
          currentBalance: debt.currentBalance,
          interestRate: debt.interestRate,
          minimumPayment: debt.minimumPayment,
          dueDay: debt.dueDay,
          lender: debt.lender,
          startDate: debt.startDate,
          endDate: debt.endDate
        })
      });

      if (res.ok) {
        const { data } = await res.json();
        setDebts(prev => [...prev, { ...debt, id: data._id }]);
      } else {
        console.error('Error adding debt');
      }
    } catch (e) {
      console.error('Error adding debt:', e);
      setDebts(prev => [...prev, debt]);
    }
  };

  const updateDebt = async (debt: Debt) => {
    try {
      const savedUser = localStorage.getItem('financeOS_user');
      if (!savedUser) {
        setDebts(prev => prev.map(d => d.id === debt.id ? debt : d));
        return;
      }

      const res = await fetch('/api/debts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: debt.id,
          name: debt.name,
          type: debt.type,
          originalAmount: debt.originalAmount,
          currentBalance: debt.currentBalance,
          interestRate: debt.interestRate,
          minimumPayment: debt.minimumPayment,
          dueDay: debt.dueDay,
          lender: debt.lender,
          startDate: debt.startDate,
          endDate: debt.endDate
        })
      });

      if (res.ok) {
        setDebts(prev => prev.map(d => d.id === debt.id ? debt : d));
      } else {
        console.error('Error updating debt');
      }
    } catch (e) {
      console.error('Error updating debt:', e);
      setDebts(prev => prev.map(d => d.id === debt.id ? debt : d));
    }
  };

  const deleteDebt = async (id: string) => {
    try {
      const savedUser = localStorage.getItem('financeOS_user');
      if (!savedUser) {
        setDebts(prev => prev.filter(d => d.id !== id));
        return;
      }

      const res = await fetch(`/api/debts?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setDebts(prev => prev.filter(d => d.id !== id));
      } else {
        console.error('Error deleting debt');
      }
    } catch (e) {
      console.error('Error deleting debt:', e);
      setDebts(prev => prev.filter(d => d.id !== id));
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const dismissRecommendation = (id: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, dismissed: true } : r));
  };

  const login = (token: string, user: UserProfile) => {
    localStorage.setItem('financeOS_token', token);
    localStorage.setItem('financeOS_user', JSON.stringify(user));
    setUser(user);
    setIsOnboarding(!user.onboardingComplete);
    if (user.mode) setUserMode(user.mode);
    if (user.currency) setCurrency(user.currency);
    if (user.country) setCountry(user.country);
  };

  const logout = () => {
    localStorage.removeItem('financeOS_token');
    localStorage.removeItem('financeOS_user');
    setUser(null);
    setAccounts([]);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setDebts([]);
    setNotifications([]);
    setRecommendations([]);
    setUserMode('salaried');
    setCurrency('USD');
    setCountry('US');
    setIsOnboarding(false);
  };

  return (
    <FinanceContext.Provider value={{
      user,
      setUser,
      isOnboarding,
      setIsOnboarding,
      userMode,
      setUserMode,
      accounts,
      setAccounts,
      addAccount,
      transactions,
      setTransactions,
      addTransaction,
      budgets,
      setBudgets,
      addBudget,
      updateBudget,
      deleteBudget,
      goals,
      setGoals,
      addGoal,
      updateGoal,
      deleteGoal,
      debts,
      setDebts,
      addDebt,
      updateDebt,
      deleteDebt,
      summary,
      notifications,
      addNotification,
      markNotificationRead,
      recommendations,
      dismissRecommendation,
      currency,
      setCurrency,
      country,
      setCountry,
      login,
      logout
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}


import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance } from '@/contexts/FinanceContext';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import { LoadingScreen } from '@/components/ui/loading-screen';
import DebtPage from '@/pages/DebtPage';
import AccountsPage from '@/components/accounts/AccountsPage';
import AICoachPage from '@/pages/AICoachPage';
import TransactionsPage from '@/pages/TransactionsPage';
import BudgetsPage from '@/pages/BudgetsPage';
import GoalsPage from '@/pages/GoalsPage';
import ReportsPage from '@/pages/ReportsPage';
import TaxCenterPage from '@/pages/TaxCenterPage';
import RetirementPage from '@/pages/RetirementPage';
import SettingsPage from '@/pages/SettingsPage';
import InsurancePage from '@/pages/InsurancePage';
import FamilyPage from '@/pages/FamilyPage';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Wallet, 
  Plus, 
  CreditCard, 
  User,
  LayoutDashboard,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

function MobileNav({ currentPage, onNavigate }: { currentPage: string, onNavigate: (page: string) => void }) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'budgets', icon: Target, label: 'Budgets' },
    { id: 'add', icon: Plus, label: 'Add', isPrimary: true },
    { id: 'transactions', icon: CreditCard, label: 'Activity' },
    { id: 'settings', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border md:hidden z-50 pb-6">
      <div className="flex items-center justify-around p-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          
          if (item.isPrimary) {
             return (
               <div key={item.id} className="-mt-8">
                 <motion.button
                   whileTap={{ scale: 0.9 }}
                   onClick={() => onNavigate(item.id)}
                   className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center"
                 >
                   <item.icon className="w-6 h-6" />
                 </motion.button>
               </div>
             );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[64px]",
                isActive ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import AuthPage from '@/pages/AuthPage';

function AppContent() {
  const { isOnboarding, setIsOnboarding, user, setUser } = useFinance();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // If no user is logged in and not in onboarding (which handles guest/new user flow), show auth
  // But wait, OnboardingWizard handles the "new user" flow.
  // We should allow users to choose between "Get Started" (Onboarding) or "Sign In" (AuthPage)
  // For now, let's say if we are NOT onboarding and NO user is set, show Auth.
  // But FinanceContext sets a user from localStorage if present.
  
  if (!user && !isOnboarding) {
      return <AuthPage onLogin={() => { /* User will be set by FinanceContext auth listener */ }} />;
  }

  if (isOnboarding) {
    return <OnboardingWizard onComplete={() => setIsOnboarding(false)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'debts':
        return <DebtPage />;
      case 'accounts':
        return <AccountsPage />;
      case 'ai-coach':
        return <AICoachPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'budgets':
        return <BudgetsPage />;
      case 'goals':
        return <GoalsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'tax':
        return <TaxCenterPage />;
      case 'retirement':
        return <RetirementPage />;
      case 'insurance':
        return <InsurancePage />;
      case 'settings':
        return <SettingsPage />;
      case 'family':
        return <FamilyPage />;
      default:
        return (
          <div className="p-8">
            <div className="finance-card text-center py-16">
              <span className="text-6xl mb-4 block">🚧</span>
              <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
              <p className="text-muted-foreground">The {currentPage} section is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <main className={cn(
        "min-h-screen transition-all duration-300 pb-20 md:pb-0",
        sidebarCollapsed ? "md:ml-[72px]" : "md:ml-[260px]"
      )}>
        {renderPage()}
      </main>

      {/* Mobile Navigation */}
      <MobileNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
}

export default function Index() {
  return (
    <FinanceProvider>
      <div className="dark">
        <AppContent />
      </div>
    </FinanceProvider>
  );
}

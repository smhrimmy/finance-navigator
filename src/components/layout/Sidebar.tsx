import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/logo';
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  PieChart, 
  Target, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Shield,
  FileText,
  Users,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'debts', label: 'Debt Manager', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'ai-coach', label: 'AI Coach', icon: Bot, isNew: true },
    { id: 'tax', label: 'Tax Center', icon: Calculator },
    { id: 'insurance', label: 'Insurance', icon: Shield },
    { id: 'retirement', label: 'Retirement', icon: Users },
  ];

  return (
    <motion.div 
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border z-40 flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight">Finance<span className="text-primary">Nav</span></span>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <Logo className="w-8 h-8" />
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleCollapse}
          className={cn("absolute -right-3 top-7 w-6 h-6 rounded-full bg-border shadow-md hover:bg-accent", collapsed && "rotate-180")}
        >
          <ChevronLeft className="w-3 h-3" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start mb-1 relative group overflow-hidden",
                collapsed ? "px-2" : "px-4",
                currentPage === item.id && "bg-primary/10 text-primary hover:bg-primary/20"
              )}
              onClick={() => onNavigate(item.id)}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", !collapsed && "mr-3")} />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md border pointer-events-none">
                  {item.label}
                </div>
              )}
              {item.isNew && !collapsed && (
                <span className="ml-auto text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium">NEW</span>
              )}
              {item.isNew && collapsed && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border mt-auto">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground",
            collapsed ? "px-2" : "px-4"
          )}
          onClick={() => onNavigate('settings')}
        >
          <Settings className={cn("w-5 h-5 flex-shrink-0", !collapsed && "mr-3")} />
          {!collapsed && <span>Settings</span>}
        </Button>
      </div>
    </motion.div>
  );
}

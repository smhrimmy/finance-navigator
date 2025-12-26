import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { countries } from '@/lib/currencies';
import { UserMode, UserProfile } from '@/types/finance';
import { useFinance } from '@/contexts/FinanceContext';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Globe, 
  User, 
  Target, 
  Sparkles,
  GraduationCap,
  Briefcase,
  Laptop,
  Users,
  Building2,
  Palmtree,
  Shield,
  TrendingUp,
  Home,
  Plane,
  Heart,
  Wallet,
  Info,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface OnboardingWizardProps {
  onComplete: () => void;
}

const steps = [
  { id: 1, title: 'Welcome', description: 'Let\'s personalize your experience' },
  { id: 2, title: 'Location', description: 'Where are you based?' },
  { id: 3, title: 'Profile', description: 'Tell us about yourself' },
  { id: 4, title: 'Goals', description: 'What are your financial goals?' },
  { id: 5, title: 'Ready', description: 'You\'re all set!' },
];

const profileModes: { id: UserMode; label: string; description: string; icon: React.ElementType; emoji: string }[] = [
  { id: 'student', label: 'Student', description: 'Managing tuition, allowance & savings', icon: GraduationCap, emoji: '🎓' },
  { id: 'salaried', label: 'Salaried Employee', description: 'Steady income, benefits & tax planning', icon: Briefcase, emoji: '💼' },
  { id: 'freelancer', label: 'Freelancer / Creator', description: 'Variable income, invoices & expenses', icon: Laptop, emoji: '💻' },
  { id: 'family', label: 'Family', description: 'Household budgets & shared expenses', icon: Users, emoji: '👨‍👩‍👧‍👦' },
  { id: 'business', label: 'Small Business', description: 'Cash flow, invoices & P&L tracking', icon: Building2, emoji: '🏢' },
  { id: 'retiree', label: 'Retiree', description: 'Withdrawal strategy & wealth preservation', icon: Palmtree, emoji: '🌴' },
];

const financialGoals = [
  { id: 'emergency', label: 'Build Emergency Fund', icon: Shield, color: '#F59E0B' },
  { id: 'debt', label: 'Pay Off Debt', icon: Wallet, color: '#EF4444' },
  { id: 'invest', label: 'Start Investing', icon: TrendingUp, color: '#10B981' },
  { id: 'home', label: 'Buy a Home', icon: Home, color: '#6366F1' },
  { id: 'travel', label: 'Travel Fund', icon: Plane, color: '#EC4899' },
  { id: 'retire', label: 'Retirement Planning', icon: Palmtree, color: '#8B5CF6' },
  { id: 'health', label: 'Health & Wellness', icon: Heart, color: '#F43F5E' },
];

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { user, setUser, setUserMode, setCountry, setCurrency, setIsOnboarding } = useFinance();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedMode, setSelectedMode] = useState<UserMode | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Update currency when country changes
  useEffect(() => {
    const country = countries.find(c => c.code === selectedCountry);
    if (country) {
      setSelectedCurrency(country.currency.code);
    }
  }, [selectedCountry]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    const country = countries.find(c => c.code === selectedCountry);
    if (country && selectedMode && user) {
      
      try {
        const updatedData = {
          id: user.id,
          country: selectedCountry,
          currency: selectedCurrency,
          mode: selectedMode,
          onboardingComplete: true,
          // We could also save goals here if the User model supported it
        };

        // Update Backend
        const res = await fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });

        if (!res.ok) {
          console.error('Failed to update user profile');
          // Proceed anyway for UX, or show error?
        }

        const { data: updatedUser } = await res.json();

        // Update Context
        setCountry(selectedCountry);
        setCurrency(selectedCurrency);
        setUserMode(selectedMode);
        
        setUser({
          ...user,
          country: selectedCountry,
          currency: selectedCurrency,
          mode: selectedMode,
          onboardingComplete: true
        });

        localStorage.setItem('financeOS_onboarding', 'complete');
        // Update stored user object as well
        const storedUser = JSON.parse(localStorage.getItem('financeOS_user') || '{}');
        localStorage.setItem('financeOS_user', JSON.stringify({
            ...storedUser,
            ...updatedUser
        }));

        setIsOnboarding(false);
        onComplete();

      } catch (error) {
        console.error('Error completing onboarding:', error);
      }
    }
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return !!selectedCountry && !!selectedCurrency;
      case 3: return !!selectedMode;
      case 4: return selectedGoals.length > 0;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-1/2 bg-purple-900/10 blur-[100px] pointer-events-none" />

      {/* Progress Header */}
      <div className="pt-12 px-8 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={handleBack} disabled={currentStep === 1} className={currentStep === 1 ? 'opacity-0' : ''}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="text-xs font-medium tracking-wider text-muted-foreground">
            STEP {currentStep} OF 5
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <div 
              key={step} 
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-500",
                step <= currentStep ? "bg-blue-600" : "bg-muted"
              )} 
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-8 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-8 py-4"
            >
              <div className="space-y-4">
                <h1 className="text-4xl font-bold">Welcome to Finance Navigator</h1>
                <p className="text-lg text-muted-foreground">
                  Your AI-powered personal finance command center. Let's customize your experience in a few simple steps.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-accent/30 border border-border/50">
                    <Sparkles className="w-8 h-8 text-blue-500 mb-3" />
                    <h3 className="font-semibold mb-1">AI Insights</h3>
                    <p className="text-xs text-muted-foreground">Smart tips to save more</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-accent/30 border border-border/50">
                    <Target className="w-8 h-8 text-emerald-500 mb-3" />
                    <h3 className="font-semibold mb-1">Goal Tracking</h3>
                    <p className="text-xs text-muted-foreground">Visualize your progress</p>
                 </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Location (Matching Screenshot) */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-8 py-4"
            >
              <div className="space-y-4">
                <h1 className="text-3xl font-bold">Where are you based?</h1>
                <p className="text-muted-foreground">
                  We use this to calculate local tax obligations and identify financial opportunities specific to your region.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Country of Residence</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="h-14 rounded-xl border-input bg-background/50 text-base">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {countries.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          <span className="flex items-center gap-2">
                            <span>{c.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1.5 text-xs text-blue-400 mt-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-selected based on your location</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Base Currency</Label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger className="h-14 rounded-xl border-input bg-background/50 text-base">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Map(countries.map(c => [c.currency.code, c])).values()).map(c => (
                         <SelectItem key={c.currency.code} value={c.currency.code}>
                           {c.currency.code} - {c.currency.symbol}
                         </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200">
                  <Info className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
                  <p className="text-sm leading-relaxed">
                    You can add multiple currencies later in your profile settings if you manage international accounts.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Profile Mode */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-8 py-4"
            >
              <div className="space-y-4">
                <h1 className="text-3xl font-bold">What best describes you?</h1>
                <p className="text-muted-foreground">
                  We'll customize your dashboard and recommendations based on this.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profileModes.map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMode(mode.id)}
                    className={cn(
                      'p-5 rounded-xl border text-left transition-all flex items-start gap-4',
                      selectedMode === mode.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-border hover:border-blue-500/50 hover:bg-accent/50'
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 text-2xl">
                      {mode.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{mode.label}</p>
                        {selectedMode === mode.id && (
                          <Check className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{mode.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Goals */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-8 py-4"
            >
              <div className="space-y-4">
                <h1 className="text-3xl font-bold">What are your priorities?</h1>
                <p className="text-muted-foreground">
                  Select all that apply. We'll help you create action plans for each.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {financialGoals.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                    <motion.button
                      key={goal.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleGoal(goal.id)}
                      className={cn(
                        'p-4 rounded-xl border text-left transition-all flex items-center gap-4',
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-border hover:border-blue-500/50 hover:bg-accent/50'
                      )}
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${goal.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: goal.color }} />
                      </div>
                      <span className="font-medium flex-1">{goal.label}</span>
                      {isSelected && (
                        <Check className="w-5 h-5 text-blue-500" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 5: Ready */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-8 py-4 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <Check className="w-12 h-12 text-green-500" />
              </motion.div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-bold">You're All Set!</h1>
                <p className="text-xl text-muted-foreground">
                  Your personalized financial dashboard is ready. Let's start building your wealth!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Button */}
      <footer className="p-8 max-w-2xl mx-auto w-full">
        <Button 
          className="w-full h-14 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700"
          onClick={currentStep === 5 ? handleComplete : handleNext}
          disabled={!canProceed()}
        >
          {currentStep === 5 ? 'Get Started' : 'Continue'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </footer>
    </div>
  );
}

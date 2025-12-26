// Core Finance Types

export type UserMode = 'student' | 'salaried' | 'freelancer' | 'family' | 'business' | 'retiree';

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
};

export type Country = {
  code: string;
  name: string;
  currency: Currency;
  taxSystem: 'progressive' | 'flat' | 'mixed';
  vatRate?: number;
  fiscalYearStart: number; // month 1-12
};

export type Account = {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'cash' | 'crypto';
  balance: number;
  currency: string;
  institution?: string;
  lastSync?: Date;
  isManual: boolean;
  color?: string;
  icon?: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  date: Date;
  amount: number;
  currency: string;
  description: string;
  category: string;
  subcategory?: string;
  type: 'income' | 'expense' | 'transfer';
  isRecurring: boolean;
  tags?: string[];
  notes?: string;
  merchant?: string;
  location?: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  budget?: number;
  parentId?: string;
};

export type Budget = {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  categoryId: string;
  rollover: boolean;
  alerts: {
    at50: boolean;
    at75: boolean;
    at90: boolean;
    atLimit: boolean;
  };
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  icon: string;
  color: string;
  type: 'savings' | 'debt_payoff' | 'investment' | 'purchase';
  priority: 'low' | 'medium' | 'high';
  autoContribute?: {
    amount: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  };
};

export type Debt = {
  id: string;
  name: string;
  type: 'credit_card' | 'personal_loan' | 'student_loan' | 'mortgage' | 'auto_loan' | 'other';
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDay: number;
  lender: string;
  startDate: Date;
  endDate?: Date;
};

export type TaxProfile = {
  id: string;
  country: string;
  residencyStatus: 'resident' | 'non_resident' | 'dual';
  employmentType: 'employed' | 'self_employed' | 'mixed' | 'retired' | 'student';
  filingStatus: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
  dependents: number;
  taxBracket?: number;
  deductions: {
    type: string;
    amount: number;
    description: string;
  }[];
};

export type InsurancePolicy = {
  id: string;
  type: 'health' | 'life' | 'auto' | 'home' | 'disability' | 'other';
  provider: string;
  policyNumber: string;
  premium: number;
  premiumFrequency: 'monthly' | 'quarterly' | 'yearly';
  coverageAmount: number;
  deductible?: number;
  startDate: Date;
  endDate?: Date;
  beneficiaries?: string[];
};

export type RetirementProfile = {
  currentAge: number;
  targetRetirementAge: number;
  lifeExpectancy: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number;
  inflationRate: number;
  desiredMonthlyIncome: number;
  socialSecurityEstimate?: number;
  pensionEstimate?: number;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  country: string;
  currency: string;
  mode: UserMode;
  createdAt: Date;
  onboardingComplete: boolean;
  preferences: {
    language: string;
    dateFormat: string;
    numberFormat: string;
    firstDayOfWeek: 0 | 1;
    theme: 'light' | 'dark' | 'system';
    notifications?: {
      email: boolean;
      push: boolean;
      budget: boolean;
      bills: boolean;
      weeklyDigest: boolean;
      goals: boolean;
    };
    privacy?: {
      twoFactorEnabled: boolean;
      dataSharing: boolean;
      analyticsEnabled: boolean;
    };
  };
};

export type AIRecommendation = {
  id: string;
  type: 'budget' | 'savings' | 'debt' | 'tax' | 'investment' | 'insurance' | 'general';
  title: string;
  description: string;
  why: string;
  how: string;
  expectedImpact: string;
  risks: string[];
  confidenceScore: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionable: boolean;
  actions?: {
    label: string;
    type: 'link' | 'action';
    target: string;
  }[];
  createdAt: Date;
  dismissed: boolean;
  implemented: boolean;
};

export type FinancialSummary = {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
  creditUtilization: number;
};

export type Notification = {
  id: string;
  type: 'alert' | 'reminder' | 'insight' | 'achievement';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
};

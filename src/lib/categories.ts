import { Category } from '@/types/finance';

export const defaultCategories: Category[] = [
  // Income
  { id: 'salary', name: 'Salary', icon: '💼', color: '#10B981', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#06B6D4', type: 'income' },
  { id: 'investments', name: 'Investment Income', icon: '📈', color: '#8B5CF6', type: 'income' },
  { id: 'rental', name: 'Rental Income', icon: '🏠', color: '#F59E0B', type: 'income' },
  { id: 'gifts_received', name: 'Gifts Received', icon: '🎁', color: '#EC4899', type: 'income' },
  { id: 'refunds', name: 'Refunds', icon: '💵', color: '#14B8A6', type: 'income' },
  { id: 'other_income', name: 'Other Income', icon: '💰', color: '#6366F1', type: 'income' },
  
  // Expenses - Housing
  { id: 'rent', name: 'Rent/Mortgage', icon: '🏠', color: '#EF4444', type: 'expense' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#F97316', type: 'expense' },
  { id: 'home_maintenance', name: 'Home Maintenance', icon: '🔧', color: '#78716C', type: 'expense' },
  { id: 'home_insurance', name: 'Home Insurance', icon: '🛡️', color: '#6B7280', type: 'expense' },
  
  // Expenses - Transportation
  { id: 'car_payment', name: 'Car Payment', icon: '🚗', color: '#3B82F6', type: 'expense' },
  { id: 'fuel', name: 'Fuel', icon: '⛽', color: '#84CC16', type: 'expense' },
  { id: 'public_transit', name: 'Public Transit', icon: '🚇', color: '#0EA5E9', type: 'expense' },
  { id: 'parking', name: 'Parking', icon: '🅿️', color: '#64748B', type: 'expense' },
  { id: 'car_maintenance', name: 'Car Maintenance', icon: '🔧', color: '#A1A1AA', type: 'expense' },
  { id: 'rideshare', name: 'Rideshare/Taxi', icon: '🚕', color: '#FBBF24', type: 'expense' },
  
  // Expenses - Food
  { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#22C55E', type: 'expense' },
  { id: 'restaurants', name: 'Restaurants', icon: '🍽️', color: '#F43F5E', type: 'expense' },
  { id: 'coffee', name: 'Coffee & Drinks', icon: '☕', color: '#92400E', type: 'expense' },
  { id: 'food_delivery', name: 'Food Delivery', icon: '🍕', color: '#EA580C', type: 'expense' },
  
  // Expenses - Shopping
  { id: 'clothing', name: 'Clothing', icon: '👔', color: '#A855F7', type: 'expense' },
  { id: 'electronics', name: 'Electronics', icon: '📱', color: '#6366F1', type: 'expense' },
  { id: 'home_goods', name: 'Home Goods', icon: '🛋️', color: '#0D9488', type: 'expense' },
  { id: 'personal_care', name: 'Personal Care', icon: '🧴', color: '#EC4899', type: 'expense' },
  
  // Expenses - Entertainment
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#8B5CF6', type: 'expense' },
  { id: 'subscriptions', name: 'Subscriptions', icon: '📺', color: '#D946EF', type: 'expense' },
  { id: 'hobbies', name: 'Hobbies', icon: '🎨', color: '#14B8A6', type: 'expense' },
  { id: 'games', name: 'Games', icon: '🎮', color: '#7C3AED', type: 'expense' },
  { id: 'books', name: 'Books', icon: '📚', color: '#0891B2', type: 'expense' },
  
  // Expenses - Health
  { id: 'health_insurance', name: 'Health Insurance', icon: '🏥', color: '#EF4444', type: 'expense' },
  { id: 'medical', name: 'Medical', icon: '💊', color: '#DC2626', type: 'expense' },
  { id: 'gym', name: 'Gym & Fitness', icon: '🏋️', color: '#16A34A', type: 'expense' },
  
  // Expenses - Education
  { id: 'tuition', name: 'Tuition', icon: '🎓', color: '#1D4ED8', type: 'expense' },
  { id: 'courses', name: 'Courses & Training', icon: '📖', color: '#2563EB', type: 'expense' },
  { id: 'school_supplies', name: 'School Supplies', icon: '✏️', color: '#3B82F6', type: 'expense' },
  
  // Expenses - Financial
  { id: 'credit_card_payment', name: 'Credit Card Payment', icon: '💳', color: '#64748B', type: 'expense' },
  { id: 'loan_payment', name: 'Loan Payment', icon: '🏦', color: '#475569', type: 'expense' },
  { id: 'bank_fees', name: 'Bank Fees', icon: '🏧', color: '#94A3B8', type: 'expense' },
  { id: 'taxes', name: 'Taxes', icon: '📋', color: '#334155', type: 'expense' },
  
  // Expenses - Travel
  { id: 'flights', name: 'Flights', icon: '✈️', color: '#0EA5E9', type: 'expense' },
  { id: 'hotels', name: 'Hotels', icon: '🏨', color: '#38BDF8', type: 'expense' },
  { id: 'vacation', name: 'Vacation', icon: '🏖️', color: '#06B6D4', type: 'expense' },
  
  // Expenses - Family
  { id: 'childcare', name: 'Childcare', icon: '👶', color: '#F472B6', type: 'expense' },
  { id: 'pet_care', name: 'Pet Care', icon: '🐕', color: '#FB923C', type: 'expense' },
  { id: 'gifts', name: 'Gifts', icon: '🎁', color: '#E879F9', type: 'expense' },
  
  // Expenses - Other
  { id: 'charity', name: 'Charity', icon: '❤️', color: '#F43F5E', type: 'expense' },
  { id: 'business', name: 'Business Expense', icon: '💼', color: '#1E293B', type: 'expense' },
  { id: 'other', name: 'Other', icon: '📦', color: '#71717A', type: 'expense' },
];

export function getCategoryById(id: string): Category | undefined {
  return defaultCategories.find(c => c.id === id);
}

export function getCategoryColor(id: string): string {
  return getCategoryById(id)?.color || '#71717A';
}

export function getCategoryIcon(id: string): string {
  return getCategoryById(id)?.icon || '📦';
}

export function getIncomeCategories(): Category[] {
  return defaultCategories.filter(c => c.type === 'income');
}

export function getExpenseCategories(): Category[] {
  return defaultCategories.filter(c => c.type === 'expense');
}

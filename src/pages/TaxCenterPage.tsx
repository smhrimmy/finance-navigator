import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  FileText, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2,
  Building,
  User,
  Users,
  Briefcase,
  Home,
  GraduationCap,
  Heart,
  DollarSign,
  AlertTriangle,
  Calendar,
  FolderOpen,
  Upload,
  ChevronRight,
  Edit2,
  Save
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/currencies';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
type EmploymentType = 'employed' | 'self_employed' | 'mixed' | 'retired' | 'student';

interface Deduction {
  id: string;
  type: string;
  description: string;
  amount: number;
  category: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  dueDate?: string;
  category: string;
}

const deductionCategories = [
  { id: 'medical', label: 'Medical & Health', icon: Heart },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'home', label: 'Home & Mortgage', icon: Home },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'charitable', label: 'Charitable', icon: Users },
  { id: 'other', label: 'Other', icon: FileText },
];

const initialChecklist: ChecklistItem[] = [
  { id: 'w2', label: 'Collect W-2 forms from employers', completed: false, category: 'documents' },
  { id: '1099', label: 'Gather 1099 forms (freelance, investments)', completed: false, category: 'documents' },
  { id: 'receipts', label: 'Organize deductible expense receipts', completed: false, category: 'documents' },
  { id: 'mortgage', label: 'Mortgage interest statement (Form 1098)', completed: false, category: 'documents' },
  { id: 'charity', label: 'Charitable donation receipts', completed: false, category: 'documents' },
  { id: 'medical', label: 'Medical expense records', completed: false, category: 'documents' },
  { id: 'review_income', label: 'Review total income for the year', completed: false, category: 'preparation' },
  { id: 'review_deductions', label: 'Calculate total deductions', completed: false, category: 'preparation' },
  { id: 'estimate_tax', label: 'Estimate tax liability', completed: false, category: 'preparation' },
  { id: 'choose_method', label: 'Decide: Standard vs Itemized deduction', completed: false, category: 'preparation' },
  { id: 'file_federal', label: 'File federal tax return', completed: false, dueDate: 'April 15', category: 'filing' },
  { id: 'file_state', label: 'File state tax return', completed: false, dueDate: 'April 15', category: 'filing' },
  { id: 'payment', label: 'Pay any tax owed or confirm refund', completed: false, category: 'filing' },
];

export default function TaxCenterPage() {
  const { currency, country } = useFinance();
  const { toast } = useToast();
  
  // Tax Profile State
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('employed');
  const [dependents, setDependents] = useState(0);
  const [annualIncome, setAnnualIncome] = useState(75000);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Deductions State
  const [deductions, setDeductions] = useState<Deduction[]>([
    { id: '1', type: 'Mortgage Interest', description: 'Primary residence', amount: 8500, category: 'home' },
    { id: '2', type: 'Health Insurance', description: 'Annual premiums', amount: 3600, category: 'medical' },
    { id: '3', type: 'Charitable Donations', description: 'Various organizations', amount: 2000, category: 'charitable' },
  ]);
  const [deductionDialogOpen, setDeductionDialogOpen] = useState(false);
  const [newDeduction, setNewDeduction] = useState({ type: '', description: '', amount: '', category: 'other' });
  
  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);

  // Calculations
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const standardDeduction = filingStatus === 'married_joint' ? 27700 : 13850;
  const useItemized = totalDeductions > standardDeduction;
  const effectiveDeduction = Math.max(totalDeductions, standardDeduction);
  const taxableIncome = Math.max(0, annualIncome - effectiveDeduction);
  
  // Simple progressive tax estimate (US 2024 approximation)
  const estimateTax = (income: number): number => {
    const brackets = [
      { max: 11600, rate: 0.10 },
      { max: 47150, rate: 0.12 },
      { max: 100525, rate: 0.22 },
      { max: 191950, rate: 0.24 },
      { max: 243725, rate: 0.32 },
      { max: 609350, rate: 0.35 },
      { max: Infinity, rate: 0.37 },
    ];
    let tax = 0;
    let remaining = income;
    let prevMax = 0;
    for (const bracket of brackets) {
      const taxableInBracket = Math.min(remaining, bracket.max - prevMax);
      if (taxableInBracket <= 0) break;
      tax += taxableInBracket * bracket.rate;
      remaining -= taxableInBracket;
      prevMax = bracket.max;
    }
    return tax;
  };
  
  const estimatedTax = estimateTax(taxableIncome);
  const effectiveTaxRate = annualIncome > 0 ? (estimatedTax / annualIncome) * 100 : 0;
  const monthlyTaxSetAside = estimatedTax / 12;

  const checklistProgress = (checklist.filter(item => item.completed).length / checklist.length) * 100;

  const handleAddDeduction = () => {
    if (!newDeduction.type || !newDeduction.amount) return;
    
    const deduction: Deduction = {
      id: Date.now().toString(),
      type: newDeduction.type,
      description: newDeduction.description,
      amount: parseFloat(newDeduction.amount),
      category: newDeduction.category,
    };
    
    setDeductions(prev => [...prev, deduction]);
    setNewDeduction({ type: '', description: '', amount: '', category: 'other' });
    setDeductionDialogOpen(false);
    toast({ title: 'Deduction added', description: `${deduction.type} has been added.` });
  };

  const handleDeleteDeduction = (id: string) => {
    setDeductions(prev => prev.filter(d => d.id !== id));
    toast({ title: 'Deduction removed' });
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tax Center</h1>
          <p className="text-muted-foreground">Manage your tax profile, deductions, and filing</p>
        </div>
        <Badge variant="outline" className="text-base px-4 py-2">
          <Calendar className="w-4 h-4 mr-2" />
          Tax Year 2024
        </Badge>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxable Income</p>
              <p className="text-xl font-bold">{formatCurrency(taxableIncome, currency)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Tax</p>
              <p className="text-xl font-bold">{formatCurrency(estimatedTax, currency)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deductions Found</p>
              <p className="text-xl font-bold text-chart-2">{formatCurrency(effectiveDeduction, currency)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="finance-card">
           <div className="flex items-center gap-3">
             <div className="relative w-12 h-12 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted/20" />
                 <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={2 * Math.PI * 20} strokeDashoffset={2 * Math.PI * 20 * (1 - 0.85)} className="text-green-500" />
               </svg>
               <span className="absolute text-xs font-bold">85%</span>
             </div>
             <div>
               <p className="text-sm text-muted-foreground">Tax Health</p>
               <p className="text-sm font-bold text-green-600">Optimized</p>
             </div>
           </div>
        </motion.div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile">Tax Profile</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="checklist">Filing Checklist</TabsTrigger>
        </TabsList>

        {/* Tax Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="finance-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tax Profile</CardTitle>
                <CardDescription>Your tax filing information</CardDescription>
              </div>
              <Button 
                variant={isEditingProfile ? "default" : "outline"} 
                size="sm"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
              >
                {isEditingProfile ? <Save className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                {isEditingProfile ? 'Save' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Filing Status</Label>
                  <Select 
                    value={filingStatus} 
                    onValueChange={(v: FilingStatus) => setFilingStatus(v)}
                    disabled={!isEditingProfile}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married_joint">Married Filing Jointly</SelectItem>
                      <SelectItem value="married_separate">Married Filing Separately</SelectItem>
                      <SelectItem value="head_of_household">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select 
                    value={employmentType} 
                    onValueChange={(v: EmploymentType) => setEmploymentType(v)}
                    disabled={!isEditingProfile}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed (W-2)</SelectItem>
                      <SelectItem value="self_employed">Self-Employed</SelectItem>
                      <SelectItem value="mixed">Mixed Income</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Number of Dependents</Label>
                  <Input 
                    type="number" 
                    value={dependents} 
                    onChange={(e) => setDependents(parseInt(e.target.value) || 0)}
                    disabled={!isEditingProfile}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Annual Gross Income</Label>
                  <Input 
                    type="number" 
                    value={annualIncome} 
                    onChange={(e) => setAnnualIncome(parseFloat(e.target.value) || 0)}
                    disabled={!isEditingProfile}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-accent/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Effective Tax Rate</span>
                  <span className="font-bold">{effectiveTaxRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Recommended Deduction</span>
                  <Badge variant={useItemized ? "default" : "secondary"}>
                    {useItemized ? 'Itemized' : 'Standard'} ({formatCurrency(effectiveDeduction, currency)})
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deductions Tab */}
        <TabsContent value="deductions" className="space-y-6">
          <Card className="finance-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tax Deductions</CardTitle>
                <CardDescription>Track your deductible expenses</CardDescription>
              </div>
              <Button onClick={() => setDeductionDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Deduction
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Deduction Comparison */}
              <div className="p-4 rounded-xl bg-accent/30 flex items-center justify-between">
                <div>
                  <p className="font-medium">Standard Deduction</p>
                  <p className="text-2xl font-bold">{formatCurrency(standardDeduction, currency)}</p>
                </div>
                <div className="text-center px-6">
                  <span className="text-muted-foreground">vs</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">Your Itemized Deductions</p>
                  <p className={cn("text-2xl font-bold", useItemized ? "text-chart-2" : "text-muted-foreground")}>
                    {formatCurrency(totalDeductions, currency)}
                  </p>
                </div>
              </div>

              {useItemized && (
                <Badge className="bg-chart-2 text-white">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Itemizing saves you {formatCurrency(totalDeductions - standardDeduction, currency)}
                </Badge>
              )}

              {/* Deductions List */}
              <div className="space-y-2">
                {deductions.map((deduction, i) => {
                  const catInfo = deductionCategories.find(c => c.id === deduction.category);
                  const Icon = catInfo?.icon || FileText;
                  
                  return (
                    <motion.div
                      key={deduction.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/50 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{deduction.type}</p>
                          <p className="text-sm text-muted-foreground">{deduction.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatCurrency(deduction.amount, currency)}</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={() => handleDeleteDeduction(deduction.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {deductions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No deductions added yet</p>
                  <p className="text-sm">Add your deductible expenses to maximize your tax savings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="space-y-6">
          <Card className="finance-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Filing Checklist</CardTitle>
                  <CardDescription>Track your tax filing progress</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{checklistProgress.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Complete</p>
                </div>
              </div>
              <Progress value={checklistProgress} className="mt-4" />
            </CardHeader>
            <CardContent className="space-y-6">
              {['documents', 'preparation', 'filing'].map(category => (
                <div key={category} className="space-y-3">
                  <h4 className="font-semibold capitalize flex items-center gap-2">
                    {category === 'documents' && <FolderOpen className="w-4 h-4" />}
                    {category === 'preparation' && <Calculator className="w-4 h-4" />}
                    {category === 'filing' && <Upload className="w-4 h-4" />}
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {checklist
                      .filter(item => item.category === category)
                      .map(item => (
                        <motion.div
                          key={item.id}
                          whileHover={{ x: 4 }}
                          onClick={() => toggleChecklistItem(item.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                            item.completed ? "bg-chart-2/10" : "bg-accent/30 hover:bg-accent/50"
                          )}
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-chart-2 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={cn(
                            "flex-1",
                            item.completed && "line-through text-muted-foreground"
                          )}>
                            {item.label}
                          </span>
                          {item.dueDate && (
                            <Badge variant="outline" className="text-xs">
                              Due: {item.dueDate}
                            </Badge>
                          )}
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Deduction Dialog */}
      <Dialog open={deductionDialogOpen} onOpenChange={setDeductionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Deduction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Deduction Type</Label>
              <Input 
                value={newDeduction.type}
                onChange={(e) => setNewDeduction(prev => ({ ...prev, type: e.target.value }))}
                placeholder="e.g., Mortgage Interest"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input 
                value={newDeduction.description}
                onChange={(e) => setNewDeduction(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Primary residence"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input 
                  type="number"
                  value={newDeduction.amount}
                  onChange={(e) => setNewDeduction(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={newDeduction.category}
                  onValueChange={(v) => setNewDeduction(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deductionCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeductionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDeduction}>Add Deduction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

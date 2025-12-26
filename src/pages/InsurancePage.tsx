import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Heart, 
  Car, 
  Home, 
  User, 
  Plus, 
  Edit2, 
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  Info,
  FileText
} from 'lucide-react';
import { InsurancePolicy } from '@/types/finance';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/currencies';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';

type PolicyType = 'health' | 'life' | 'auto' | 'home' | 'disability' | 'other';

interface UnderinsuranceCheck {
  type: PolicyType;
  label: string;
  description: string;
  recommendedCoverage: number;
  currentCoverage: number;
  isUnderinsured: boolean;
  priority: 'high' | 'medium' | 'low';
}

const policyTypeConfig: Record<PolicyType, { icon: React.ElementType; color: string; label: string }> = {
  health: { icon: Heart, color: '#EF4444', label: 'Health Insurance' },
  life: { icon: User, color: '#8B5CF6', label: 'Life Insurance' },
  auto: { icon: Car, color: '#3B82F6', label: 'Auto Insurance' },
  home: { icon: Home, color: '#F59E0B', label: 'Home Insurance' },
  disability: { icon: Shield, color: '#10B981', label: 'Disability Insurance' },
  other: { icon: FileText, color: '#6B7280', label: 'Other Insurance' },
};

const samplePolicies: InsurancePolicy[] = [
  {
    id: '1',
    type: 'health',
    provider: 'Blue Cross Blue Shield',
    policyNumber: 'BCBS-2024-001',
    premium: 450,
    premiumFrequency: 'monthly',
    coverageAmount: 500000,
    deductible: 2500,
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 11, 31),
  },
  {
    id: '2',
    type: 'life',
    provider: 'MetLife',
    policyNumber: 'ML-TERM-500K',
    premium: 85,
    premiumFrequency: 'monthly',
    coverageAmount: 500000,
    startDate: new Date(2023, 5, 1),
    beneficiaries: ['Jane Doe', 'Kids Trust'],
  },
  {
    id: '3',
    type: 'auto',
    provider: 'State Farm',
    policyNumber: 'SF-AUTO-2024',
    premium: 150,
    premiumFrequency: 'monthly',
    coverageAmount: 100000,
    deductible: 500,
    startDate: new Date(2024, 2, 1),
    endDate: new Date(2025, 2, 1),
  },
  {
    id: '4',
    type: 'home',
    provider: 'Allstate',
    policyNumber: 'AS-HOME-450K',
    premium: 1800,
    premiumFrequency: 'yearly',
    coverageAmount: 450000,
    deductible: 1000,
    startDate: new Date(2024, 0, 15),
    endDate: new Date(2025, 0, 15),
  },
];

export default function InsurancePage() {
  const { currency } = useFinance();
  const { toast } = useToast();
  const [policies, setPolicies] = useState<InsurancePolicy[]>(samplePolicies);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | undefined>();

  // Form state
  const [formType, setFormType] = useState<PolicyType>('health');
  const [formProvider, setFormProvider] = useState('');
  const [formPolicyNumber, setFormPolicyNumber] = useState('');
  const [formPremium, setFormPremium] = useState('');
  const [formFrequency, setFormFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [formCoverage, setFormCoverage] = useState('');
  const [formDeductible, setFormDeductible] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  // Underinsurance detection (rule-based)
  const underinsuranceChecks = useMemo((): UnderinsuranceCheck[] => {
    const annualIncome = 75000; // Would come from user profile
    const homeValue = 500000; // Would come from user data
    const carValue = 35000;
    const dependents = 2;

    const healthPolicy = policies.find(p => p.type === 'health');
    const lifePolicy = policies.find(p => p.type === 'life');
    const autoPolicy = policies.find(p => p.type === 'auto');
    const homePolicy = policies.find(p => p.type === 'home');
    const disabilityPolicy = policies.find(p => p.type === 'disability');

    const checks: UnderinsuranceCheck[] = [
      {
        type: 'life',
        label: 'Life Insurance',
        description: `Recommended: 10-12x annual income (${formatCurrency(annualIncome * 10, currency)} - ${formatCurrency(annualIncome * 12, currency)})`,
        recommendedCoverage: annualIncome * 10,
        currentCoverage: lifePolicy?.coverageAmount || 0,
        isUnderinsured: (lifePolicy?.coverageAmount || 0) < annualIncome * 10,
        priority: dependents > 0 ? 'high' : 'medium',
      },
      {
        type: 'health',
        label: 'Health Insurance',
        description: 'Ensure adequate coverage for medical expenses and emergencies',
        recommendedCoverage: 500000,
        currentCoverage: healthPolicy?.coverageAmount || 0,
        isUnderinsured: !healthPolicy,
        priority: 'high',
      },
      {
        type: 'home',
        label: 'Home Insurance',
        description: `Should cover full replacement cost of home (~${formatCurrency(homeValue, currency)})`,
        recommendedCoverage: homeValue,
        currentCoverage: homePolicy?.coverageAmount || 0,
        isUnderinsured: (homePolicy?.coverageAmount || 0) < homeValue * 0.8,
        priority: 'high',
      },
      {
        type: 'auto',
        label: 'Auto Insurance',
        description: 'Liability coverage should be at least 100/300/100',
        recommendedCoverage: 100000,
        currentCoverage: autoPolicy?.coverageAmount || 0,
        isUnderinsured: (autoPolicy?.coverageAmount || 0) < 100000,
        priority: 'medium',
      },
      {
        type: 'disability',
        label: 'Disability Insurance',
        description: 'Should replace 60-70% of income if unable to work',
        recommendedCoverage: annualIncome * 0.65,
        currentCoverage: disabilityPolicy?.coverageAmount || 0,
        isUnderinsured: !disabilityPolicy,
        priority: 'medium',
      },
    ];

    return checks;
  }, [policies, currency]);

  const totalAnnualPremiums = useMemo(() => {
    return policies.reduce((total, policy) => {
      const annualAmount = policy.premiumFrequency === 'yearly' 
        ? policy.premium 
        : policy.premiumFrequency === 'quarterly'
        ? policy.premium * 4
        : policy.premium * 12;
      return total + annualAmount;
    }, 0);
  }, [policies]);

  const totalCoverage = useMemo(() => {
    return policies.reduce((total, policy) => total + policy.coverageAmount, 0);
  }, [policies]);

  const underinsuredCount = underinsuranceChecks.filter(c => c.isUnderinsured).length;

  const handleOpenDialog = (policy?: InsurancePolicy) => {
    if (policy) {
      setEditingPolicy(policy);
      setFormType(policy.type);
      setFormProvider(policy.provider);
      setFormPolicyNumber(policy.policyNumber);
      setFormPremium(policy.premium.toString());
      setFormFrequency(policy.premiumFrequency);
      setFormCoverage(policy.coverageAmount.toString());
      setFormDeductible(policy.deductible?.toString() || '');
      setFormStartDate(format(new Date(policy.startDate), 'yyyy-MM-dd'));
      setFormEndDate(policy.endDate ? format(new Date(policy.endDate), 'yyyy-MM-dd') : '');
    } else {
      setEditingPolicy(undefined);
      setFormType('health');
      setFormProvider('');
      setFormPolicyNumber('');
      setFormPremium('');
      setFormFrequency('monthly');
      setFormCoverage('');
      setFormDeductible('');
      setFormStartDate('');
      setFormEndDate('');
    }
    setDialogOpen(true);
  };

  const handleSavePolicy = () => {
    const policy: InsurancePolicy = {
      id: editingPolicy?.id || Date.now().toString(),
      type: formType,
      provider: formProvider,
      policyNumber: formPolicyNumber,
      premium: parseFloat(formPremium) || 0,
      premiumFrequency: formFrequency,
      coverageAmount: parseFloat(formCoverage) || 0,
      deductible: formDeductible ? parseFloat(formDeductible) : undefined,
      startDate: new Date(formStartDate),
      endDate: formEndDate ? new Date(formEndDate) : undefined,
    };

    if (editingPolicy) {
      setPolicies(prev => prev.map(p => p.id === editingPolicy.id ? policy : p));
      toast({ title: 'Policy updated', description: `${policyTypeConfig[formType].label} has been updated.` });
    } else {
      setPolicies(prev => [...prev, policy]);
      toast({ title: 'Policy added', description: `${policyTypeConfig[formType].label} has been added.` });
    }
    setDialogOpen(false);
  };

  const handleDeletePolicy = (id: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Policy removed' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Insurance</h1>
          <p className="text-muted-foreground">Track coverage and detect gaps</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Policy
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Policies</p>
              <p className="text-xl font-bold">{policies.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Coverage</p>
              <p className="text-xl font-bold text-chart-2">{formatCurrency(totalCoverage, currency)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Annual Premiums</p>
              <p className="text-xl font-bold">{formatCurrency(totalAnnualPremiums, currency)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              underinsuredCount > 0 ? "bg-destructive/10" : "bg-chart-2/10"
            )}>
              {underinsuredCount > 0 ? (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-chart-2" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Coverage Gaps</p>
              <p className={cn("text-xl font-bold", underinsuredCount > 0 ? "text-destructive" : "text-chart-2")}>
                {underinsuredCount > 0 ? `${underinsuredCount} found` : 'All good!'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Underinsurance Alerts */}
      {underinsuredCount > 0 && (
        <Card className="finance-card border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Underinsurance Detected
            </CardTitle>
            <CardDescription>Review these coverage gaps based on your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {underinsuranceChecks.filter(c => c.isUnderinsured).map((check, i) => {
              const config = policyTypeConfig[check.type];
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={check.type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20"
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{check.label}</p>
                      <Badge variant={check.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {check.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{check.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span>Current: <strong>{formatCurrency(check.currentCoverage, currency)}</strong></span>
                      <span>Recommended: <strong>{formatCurrency(check.recommendedCoverage, currency)}</strong></span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleOpenDialog()}>
                    Add Coverage
                  </Button>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Policies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {policies.map((policy, i) => {
            const config = policyTypeConfig[policy.type];
            const Icon = config.icon;
            const daysUntilRenewal = policy.endDate 
              ? differenceInDays(new Date(policy.endDate), new Date()) 
              : null;
            const needsRenewal = daysUntilRenewal !== null && daysUntilRenewal <= 30 && daysUntilRenewal > 0;
            const isExpired = daysUntilRenewal !== null && daysUntilRenewal < 0;

            return (
              <motion.div
                key={policy.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "finance-card group",
                  isExpired && "border-destructive/50",
                  needsRenewal && "border-chart-4/50"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: config.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{config.label}</h3>
                      <p className="text-sm text-muted-foreground">{policy.provider}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(policy)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeletePolicy(policy.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {(needsRenewal || isExpired) && (
                  <Badge variant={isExpired ? "destructive" : "default"} className="mb-3">
                    {isExpired ? 'Expired' : `Renews in ${daysUntilRenewal} days`}
                  </Badge>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Policy Number</span>
                    <span className="font-mono">{policy.policyNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-semibold">{formatCurrency(policy.coverageAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Premium</span>
                    <span>{formatCurrency(policy.premium, currency)}/{policy.premiumFrequency.replace('ly', '')}</span>
                  </div>
                  {policy.deductible && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deductible</span>
                      <span>{formatCurrency(policy.deductible, currency)}</span>
                    </div>
                  )}
                  {policy.endDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valid Until</span>
                      <span>{format(new Date(policy.endDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {policies.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="finance-card text-center py-12">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No insurance policies</h3>
          <p className="text-muted-foreground mb-4">Add your insurance policies to track coverage and detect gaps</p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Policy
          </Button>
        </motion.div>
      )}

      {/* Add/Edit Policy Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPolicy ? 'Edit Policy' : 'Add Insurance Policy'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Policy Type</Label>
                <Select value={formType} onValueChange={(v: PolicyType) => setFormType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(policyTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Input value={formProvider} onChange={(e) => setFormProvider(e.target.value)} placeholder="e.g., Blue Cross" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Policy Number</Label>
              <Input value={formPolicyNumber} onChange={(e) => setFormPolicyNumber(e.target.value)} placeholder="Policy ID" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Premium Amount</Label>
                <Input type="number" value={formPremium} onChange={(e) => setFormPremium(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={formFrequency} onValueChange={(v: 'monthly' | 'quarterly' | 'yearly') => setFormFrequency(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Coverage Amount</Label>
                <Input type="number" value={formCoverage} onChange={(e) => setFormCoverage(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Deductible (Optional)</Label>
                <Input type="number" value={formDeductible} onChange={(e) => setFormDeductible(e.target.value)} placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Input type="date" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePolicy}>
              {editingPolicy ? 'Save Changes' : 'Add Policy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

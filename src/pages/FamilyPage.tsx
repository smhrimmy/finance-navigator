import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Crown,
  User,
  Baby,
  Heart,
  Wallet,
  PiggyBank,
  Calendar,
  Mail,
  Phone,
  MoreVertical
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/currencies';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type FamilyRole = 'primary' | 'spouse' | 'child' | 'parent' | 'sibling' | 'other';

interface FamilyMember {
  id: string;
  name: string;
  role: FamilyRole;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  monthlyAllowance?: number;
  monthlyExpenses?: number;
  isDependent: boolean;
  avatar?: string;
  color: string;
}

const roleConfig: Record<FamilyRole, { icon: React.ElementType; label: string; color: string }> = {
  primary: { icon: Crown, label: 'Primary Account Holder', color: '#F59E0B' },
  spouse: { icon: Heart, label: 'Spouse/Partner', color: '#EC4899' },
  child: { icon: Baby, label: 'Child', color: '#3B82F6' },
  parent: { icon: User, label: 'Parent', color: '#8B5CF6' },
  sibling: { icon: Users, label: 'Sibling', color: '#10B981' },
  other: { icon: User, label: 'Other', color: '#6B7280' },
};

const avatarColors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#06B6D4'];

const sampleMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'John Doe',
    role: 'primary',
    email: 'john@example.com',
    phone: '+1 555-123-4567',
    dateOfBirth: new Date(1985, 5, 15),
    monthlyExpenses: 3500,
    isDependent: false,
    color: '#3B82F6',
  },
  {
    id: '2',
    name: 'Jane Doe',
    role: 'spouse',
    email: 'jane@example.com',
    dateOfBirth: new Date(1988, 2, 22),
    monthlyExpenses: 2800,
    isDependent: false,
    color: '#EC4899',
  },
  {
    id: '3',
    name: 'Emma Doe',
    role: 'child',
    dateOfBirth: new Date(2015, 8, 10),
    monthlyAllowance: 50,
    monthlyExpenses: 400,
    isDependent: true,
    color: '#8B5CF6',
  },
  {
    id: '4',
    name: 'Lucas Doe',
    role: 'child',
    dateOfBirth: new Date(2018, 3, 5),
    monthlyAllowance: 30,
    monthlyExpenses: 350,
    isDependent: true,
    color: '#10B981',
  },
];

export default function FamilyPage() {
  const { currency } = useFinance();
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>(sampleMembers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>();

  // Form state
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<FamilyRole>('child');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formAllowance, setFormAllowance] = useState('');
  const [formExpenses, setFormExpenses] = useState('');
  const [formIsDependent, setFormIsDependent] = useState(true);
  const [formColor, setFormColor] = useState(avatarColors[0]);

  const totalExpenses = members.reduce((sum, m) => sum + (m.monthlyExpenses || 0), 0);
  const totalAllowances = members.reduce((sum, m) => sum + (m.monthlyAllowance || 0), 0);
  const dependentCount = members.filter(m => m.isDependent).length;

  const handleOpenDialog = (member?: FamilyMember) => {
    if (member) {
      setEditingMember(member);
      setFormName(member.name);
      setFormRole(member.role);
      setFormEmail(member.email || '');
      setFormPhone(member.phone || '');
      setFormDob(member.dateOfBirth ? format(new Date(member.dateOfBirth), 'yyyy-MM-dd') : '');
      setFormAllowance(member.monthlyAllowance?.toString() || '');
      setFormExpenses(member.monthlyExpenses?.toString() || '');
      setFormIsDependent(member.isDependent);
      setFormColor(member.color);
    } else {
      setEditingMember(undefined);
      setFormName('');
      setFormRole('child');
      setFormEmail('');
      setFormPhone('');
      setFormDob('');
      setFormAllowance('');
      setFormExpenses('');
      setFormIsDependent(true);
      setFormColor(avatarColors[Math.floor(Math.random() * avatarColors.length)]);
    }
    setDialogOpen(true);
  };

  const handleSaveMember = () => {
    const member: FamilyMember = {
      id: editingMember?.id || Date.now().toString(),
      name: formName,
      role: formRole,
      email: formEmail || undefined,
      phone: formPhone || undefined,
      dateOfBirth: formDob ? new Date(formDob) : undefined,
      monthlyAllowance: formAllowance ? parseFloat(formAllowance) : undefined,
      monthlyExpenses: formExpenses ? parseFloat(formExpenses) : undefined,
      isDependent: formIsDependent,
      color: formColor,
    };

    if (editingMember) {
      setMembers(prev => prev.map(m => m.id === editingMember.id ? member : m));
      toast({ title: 'Member updated', description: `${member.name}'s profile has been updated.` });
    } else {
      setMembers(prev => [...prev, member]);
      toast({ title: 'Member added', description: `${member.name} has been added to your family.` });
    }
    setDialogOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    const member = members.find(m => m.id === id);
    if (member?.role === 'primary') {
      toast({ title: 'Cannot remove', description: 'The primary account holder cannot be removed.', variant: 'destructive' });
      return;
    }
    setMembers(prev => prev.filter(m => m.id !== id));
    toast({ title: 'Member removed' });
  };

  const getAge = (dob: Date) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Family</h1>
          <p className="text-muted-foreground">Manage family members and shared finances</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Family Members</p>
              <p className="text-xl font-bold">{members.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <Baby className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dependents</p>
              <p className="text-xl font-bold">{dependentCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Monthly Expenses</p>
              <p className="text-xl font-bold">{formatCurrency(totalExpenses, currency)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="finance-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Allowances</p>
              <p className="text-xl font-bold">{formatCurrency(totalAllowances, currency)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Family Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {members.map((member, i) => {
            const config = roleConfig[member.role];
            const RoleIcon = config.icon;
            const age = member.dateOfBirth ? getAge(member.dateOfBirth) : null;
            
            return (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="finance-card group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14 border-2" style={{ borderColor: member.color }}>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback style={{ backgroundColor: `${member.color}20`, color: member.color }}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {member.name}
                        {member.role === 'primary' && (
                          <Crown className="w-4 h-4 text-chart-4" />
                        )}
                      </h3>
                      <Badge variant="outline" className="text-xs" style={{ borderColor: config.color, color: config.color }}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(member)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-destructive"
                        disabled={member.role === 'primary'}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 text-sm">
                  {age !== null && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{age} years old</span>
                      {member.isDependent && <Badge variant="secondary" className="text-xs">Dependent</Badge>}
                    </div>
                  )}
                  
                  {member.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  
                  {member.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                  {member.monthlyAllowance !== undefined && (
                    <div>
                      <p className="text-xs text-muted-foreground">Allowance</p>
                      <p className="font-semibold text-chart-2">{formatCurrency(member.monthlyAllowance, currency)}/mo</p>
                    </div>
                  )}
                  {member.monthlyExpenses !== undefined && (
                    <div>
                      <p className="text-xs text-muted-foreground">Expenses</p>
                      <p className="font-semibold">{formatCurrency(member.monthlyExpenses, currency)}/mo</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add/Edit Member Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Family Member' : 'Add Family Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <Label>Avatar Color</Label>
                <div className="flex gap-2">
                  {avatarColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-transform",
                        formColor === color && "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formRole} onValueChange={(v: FamilyRole) => setFormRole(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email (Optional)</Label>
                <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone (Optional)</Label>
                <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+1 555-000-0000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={formDob} onChange={(e) => setFormDob(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Is Dependent?</Label>
                <Select value={formIsDependent ? 'yes' : 'no'} onValueChange={(v) => setFormIsDependent(v === 'yes')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Allowance</Label>
                <Input type="number" value={formAllowance} onChange={(e) => setFormAllowance(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Monthly Expenses</Label>
                <Input type="number" value={formExpenses} onChange={(e) => setFormExpenses(e.target.value)} placeholder="0" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMember}>
              {editingMember ? 'Save Changes' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

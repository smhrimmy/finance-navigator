/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  Globe,
  Moon,
  Sun,
  Palette,
  Languages,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Save,
  AlertTriangle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { countries, currencies } from '@/lib/currencies';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, setUser, currency, setCurrency, country, setCountry, userMode, setUserMode } = useFinance();
  const { toast } = useToast();

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+1 555-123-4567');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Preferences state
  const [theme, setTheme] = useState(user?.preferences?.theme || 'dark');
  const [dateFormat, setDateFormat] = useState(user?.preferences?.dateFormat || 'MM/DD/YYYY');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<0 | 1>(user?.preferences?.firstDayOfWeek as 0 | 1 || 0);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(user?.preferences?.notifications?.email ?? true);
  const [pushNotifications, setPushNotifications] = useState(user?.preferences?.notifications?.push ?? true);
  const [budgetAlerts, setBudgetAlerts] = useState(user?.preferences?.notifications?.budget ?? true);
  const [billReminders, setBillReminders] = useState(user?.preferences?.notifications?.bills ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState(user?.preferences?.notifications?.weeklyDigest ?? true);
  const [goalMilestones, setGoalMilestones] = useState(user?.preferences?.notifications?.goals ?? true);

  // Privacy state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.preferences?.privacy?.twoFactorEnabled ?? false);
  const [dataSharing, setDataSharing] = useState(user?.preferences?.privacy?.dataSharing ?? false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(user?.preferences?.privacy?.analyticsEnabled ?? true);

  // Delete confirmation
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const updateBackend = async (data: any) => {
    if (!user) return;
    try {
        await fetch('/api/user', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, ...data })
        });
        
        // Update local user object
        setUser({ ...user, ...data });
    } catch (error) {
        console.error('Failed to save settings', error);
        toast({ title: 'Error', description: 'Failed to save changes.', variant: 'destructive' });
    }
  };

  const handleSaveProfile = async () => {
    setIsEditingProfile(false);
    await updateBackend({ name, email, mode: userMode });
    toast({ title: 'Profile updated', description: 'Your profile has been saved.' });
  };

  const handlePreferenceChange = (key: string, value: string | number) => {
      // Update local state map
      if (key === 'theme') setTheme(value as 'dark' | 'light' | 'system');
      if (key === 'dateFormat') setDateFormat(value as string);
      if (key === 'firstDayOfWeek') setFirstDayOfWeek(value as 0 | 1);

      // Build preferences object
      const newPreferences = {
          ...user?.preferences,
          [key]: value
      };
      
      updateBackend({ preferences: newPreferences });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
      if (key === 'email') setEmailNotifications(value);
      if (key === 'push') setPushNotifications(value);
      if (key === 'budget') setBudgetAlerts(value);
      if (key === 'bills') setBillReminders(value);
      if (key === 'weeklyDigest') setWeeklyDigest(value);
      if (key === 'goals') setGoalMilestones(value);

      const newNotifications = {
          email: key === 'email' ? value : emailNotifications,
          push: key === 'push' ? value : pushNotifications,
          budget: key === 'budget' ? value : budgetAlerts,
          bills: key === 'bills' ? value : billReminders,
          weeklyDigest: key === 'weeklyDigest' ? value : weeklyDigest,
          goals: key === 'goals' ? value : goalMilestones,
      };

      const newPreferences = {
          ...user?.preferences,
          notifications: newNotifications
      };

      updateBackend({ preferences: newPreferences });
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
      if (key === 'twoFactorEnabled') setTwoFactorEnabled(value);
      if (key === 'dataSharing') setDataSharing(value);
      if (key === 'analyticsEnabled') setAnalyticsEnabled(value);

      const newPrivacy = {
          twoFactorEnabled: key === 'twoFactorEnabled' ? value : twoFactorEnabled,
          dataSharing: key === 'dataSharing' ? value : dataSharing,
          analyticsEnabled: key === 'analyticsEnabled' ? value : analyticsEnabled,
      };

      const newPreferences = {
          ...user?.preferences,
          privacy: newPrivacy
      };

      updateBackend({ preferences: newPreferences });
  };


  const handleExportData = (format: 'csv' | 'json') => {
    // In a real app, this would generate and download user data
    toast({ 
      title: 'Data export started', 
      description: `Your ${format.toUpperCase()} export will be ready shortly.` 
    });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText === 'DELETE') {
      toast({ 
        title: 'Account deletion requested',
        description: 'Your account will be deleted within 30 days.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="finance-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </div>
              <Button 
                variant={isEditingProfile ? "default" : "outline"} 
                onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
              >
                {isEditingProfile ? <Save className="w-4 h-4 mr-2" /> : <User className="w-4 h-4 mr-2" />}
                {isEditingProfile ? 'Save' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-wealth flex items-center justify-center text-white text-2xl font-bold">
                  {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{name}</h3>
                  <p className="text-muted-foreground">{email}</p>
                  <Badge variant="outline" className="mt-2 capitalize">{userMode} Mode</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label>User Mode</Label>
                  <Select 
                    value={userMode} 
                    onValueChange={(v) => setUserMode(v as any)}
                    disabled={!isEditingProfile}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">🎓 Student</SelectItem>
                      <SelectItem value="salaried">💼 Salaried</SelectItem>
                      <SelectItem value="freelancer">💻 Freelancer</SelectItem>
                      <SelectItem value="family">👨‍👩‍👧‍👦 Family</SelectItem>
                      <SelectItem value="business">🏢 Business</SelectItem>
                      <SelectItem value="retiree">🌴 Retiree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="finance-card">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Lock className="w-4 h-4" />
                Change Password
              </Button>
              <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="finance-card">
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>Country, currency, and locale preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={country} onValueChange={(v) => { setCountry(v); updateBackend({ country: v }); }}>
                    <SelectTrigger>
                      <Globe className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={(v) => { setCurrency(v); updateBackend({ currency: v }); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.symbol} {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select value={dateFormat} onValueChange={(v) => handlePreferenceChange('dateFormat', v)}>
                    <SelectTrigger>
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>First Day of Week</Label>
                  <Select 
                    value={firstDayOfWeek.toString()} 
                    onValueChange={(v) => handlePreferenceChange('firstDayOfWeek', parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="finance-card">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <motion.button
                      key={t}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePreferenceChange('theme', t)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center",
                        theme === t 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {t === 'light' && <Sun className="w-6 h-6 mx-auto mb-2" />}
                      {t === 'dark' && <Moon className="w-6 h-6 mx-auto mb-2" />}
                      {t === 'system' && <SettingsIcon className="w-6 h-6 mx-auto mb-2" />}
                      <span className="capitalize">{t}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="finance-card">
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>How you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Email Notifications', desc: 'Receive updates via email', value: emailNotifications, key: 'email' },
                { label: 'Push Notifications', desc: 'Browser push notifications', value: pushNotifications, key: 'push' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.value} onCheckedChange={(v) => handleNotificationChange(item.key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="finance-card">
            <CardHeader>
              <CardTitle>Alert Types</CardTitle>
              <CardDescription>Choose which alerts to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Budget Alerts', desc: 'When approaching or exceeding budget limits', value: budgetAlerts, key: 'budget' },
                { label: 'Bill Reminders', desc: 'Upcoming bill payment reminders', value: billReminders, key: 'bills' },
                { label: 'Weekly Digest', desc: 'Weekly summary of your finances', value: weeklyDigest, key: 'weeklyDigest' },
                { label: 'Goal Milestones', desc: 'Celebrate when you hit savings milestones', value: goalMilestones, key: 'goals' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.value} onCheckedChange={(v) => handleNotificationChange(item.key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="finance-card">
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>Control your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                <div>
                  <p className="font-medium">Anonymous Analytics</p>
                  <p className="text-sm text-muted-foreground">Help us improve by sharing anonymous usage data</p>
                </div>
                <Switch checked={analyticsEnabled} onCheckedChange={(v) => handlePrivacyChange('analyticsEnabled', v)} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                <div>
                  <p className="font-medium">Data Sharing with Third Parties</p>
                  <p className="text-sm text-muted-foreground">Share data with partner services</p>
                </div>
                <Switch checked={dataSharing} onCheckedChange={(v) => handlePrivacyChange('dataSharing', v)} />
              </div>
            </CardContent>
          </Card>

          <Card className="finance-card">
            <CardHeader>
              <CardTitle>Export Your Data</CardTitle>
              <CardDescription>Download a copy of all your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export all your financial data including transactions, budgets, goals, and settings.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleExportData('csv')} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export as CSV
                </Button>
                <Button variant="outline" onClick={() => handleExportData('json')} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Export as JSON
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="finance-card border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2 py-4">
                    <Label>Type DELETE to confirm</Label>
                    <Input 
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE'}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

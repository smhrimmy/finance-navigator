import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Plus, 
  MoreHorizontal,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Receipt,
  X,
  ChevronDown,
  FileSpreadsheet,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFinance } from '@/contexts/FinanceContext';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currencies';
import { defaultCategories, getCategoryById } from '@/lib/categories';
import { sampleTransactions, sampleAccounts } from '@/lib/sampleData';
import { Transaction } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';

const typeIcons = {
  income: ArrowDownLeft,
  expense: ArrowUpRight,
  transfer: ArrowLeftRight,
};

const typeColors = {
  income: 'text-finance-positive bg-finance-positive/10',
  expense: 'text-finance-negative bg-finance-negative/10',
  transfer: 'text-primary bg-primary/10',
};

export default function TransactionsPage() {
  const { currency, transactions, setTransactions, addTransaction } = useFinance();
  const { toast } = useToast();
  
  // Local state for filters and UI only
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense' | 'transfer',
    category: '',
    accountId: 'acc_1',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Filtering logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.merchant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
      
      const txDate = new Date(tx.date);
      const matchesDateFrom = !dateRange.from || txDate >= new Date(dateRange.from);
      const matchesDateTo = !dateRange.to || txDate <= new Date(dateRange.to);
      
      return matchesSearch && matchesType && matchesCategory && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, typeFilter, categoryFilter, dateRange]);

  // Summary calculations
  const summary = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
    return { income, expenses, net: income - expenses, count: filteredTransactions.length };
  }, [filteredTransactions]);

  // Handle adding new transaction
  const handleAddTransaction = () => {
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      accountId: newTransaction.accountId,
      date: new Date(newTransaction.date),
      amount: newTransaction.type === 'expense' ? -Math.abs(Number(newTransaction.amount)) : Math.abs(Number(newTransaction.amount)),
      currency,
      description: newTransaction.description,
      category: newTransaction.category,
      type: newTransaction.type,
      isRecurring: false,
      notes: newTransaction.notes,
    };
    
    setTransactions([tx, ...transactions]);
    setAddDialogOpen(false);
    setNewTransaction({
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      accountId: 'acc_1',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    
    toast({ title: 'Transaction added', description: 'Your transaction has been recorded.' });
  };

  // Handle CSV import
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        
        const dateIdx = headers.findIndex(h => h.includes('date'));
        const descIdx = headers.findIndex(h => h.includes('description') || h.includes('memo'));
        const amountIdx = headers.findIndex(h => h.includes('amount'));
        const typeIdx = headers.findIndex(h => h.includes('type'));
        
        const newTxs: Transaction[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const amount = parseFloat(values[amountIdx]) || 0;
          
          newTxs.push({
            id: `tx_import_${Date.now()}_${i}`,
            accountId: 'acc_1',
            date: new Date(values[dateIdx] || new Date()),
            amount,
            currency,
            description: values[descIdx] || 'Imported transaction',
            category: 'other',
            type: typeIdx >= 0 ? (values[typeIdx] as 'income' | 'expense' | 'transfer') : (amount >= 0 ? 'income' : 'expense'),
            isRecurring: false,
          });
        }
        
        setTransactions([...newTxs, ...transactions]);
        setCsvDialogOpen(false);
        toast({ 
          title: 'Import successful', 
          description: `Imported ${newTxs.length} transactions from CSV.` 
        });
      } catch (error) {
        toast({ 
          title: 'Import failed', 
          description: 'Could not parse CSV file. Check the format.',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
  };

  // Handle receipt upload
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTransaction) return;

    try {
      // TODO: Implement file storage (e.g., AWS S3, Cloudinary, or MongoDB GridFS)
      // For now, we are disabling Supabase storage.
      
      toast({ 
        title: 'Feature Unavailable', 
        description: 'Receipt storage is currently being migrated to the new backend.',
        variant: 'destructive'
      });

      /*
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedTransaction.id}_${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      // Update transaction with receipt URL (in real app, save to DB)
      setTransactions(txs => txs.map(tx => 
        tx.id === selectedTransaction.id 
          ? { ...tx, notes: `Receipt: ${publicUrl}` }
          : tx
      ));
      */

      setReceiptDialogOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      toast({ 
        title: 'Upload failed', 
        description: 'Could not upload receipt.',
        variant: 'destructive'
      });
    }
  };

  // Handle bulk categorization
  const handleBulkCategorize = (category: string) => {
    setTransactions(txs => txs.map(tx => 
      selectedTransactions.has(tx.id) ? { ...tx, category } : tx
    ));
    setSelectedTransactions(new Set());
    toast({ title: 'Categorized', description: `Updated ${selectedTransactions.size} transactions.` });
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Account'];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.date).toISOString().split('T')[0],
      tx.description,
      tx.amount.toString(),
      tx.type,
      tx.category,
      tx.accountId
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({ title: 'Exported', description: 'Transactions exported to CSV.' });
  };

  const toggleSelectAll = () => {
    if (selectedTransactions.size === filteredTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(filteredTransactions.map(t => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedTransactions);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedTransactions(newSet);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Track and manage all your financial transactions</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* CSV Import */}
          <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Transactions</DialogTitle>
                <DialogDescription>
                  Upload a CSV file with columns: Date, Description, Amount, Type (optional)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>

          {/* Add Transaction */}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-primary">
                <Plus className="w-4 h-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-2">
                  {(['expense', 'income', 'transfer'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewTransaction({ ...newTransaction, type })}
                      className={`p-3 rounded-xl border-2 transition-all capitalize ${
                        newTransaction.type === type 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="What was this for?"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newTransaction.category}
                      onValueChange={(v) => setNewTransaction({ ...newTransaction, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultCategories
                          .filter(c => c.type === newTransaction.type || newTransaction.type === 'transfer')
                          .map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <span className="flex items-center gap-2">
                                <span>{cat.icon}</span>
                                {cat.name}
                              </span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Account</Label>
                    <Select
                      value={newTransaction.accountId}
                      onValueChange={(v) => setNewTransaction({ ...newTransaction, accountId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleAccounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>
                            <span className="flex items-center gap-2">
                              <span>{acc.icon}</span>
                              {acc.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    placeholder="Any additional details..."
                    value={newTransaction.notes}
                    onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                  />
                </div>

                <Button 
                  className="w-full bg-gradient-primary" 
                  onClick={handleAddTransaction}
                  disabled={!newTransaction.description || !newTransaction.amount || !newTransaction.category}
                >
                  Add Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Accounts Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sampleAccounts.slice(0, 3).map((account, i) => (
          <motion.div 
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="finance-card hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-2xl">
                    {account.icon}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {account.type}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{account.name}</p>
                  <p className="text-2xl font-bold">{formatCurrency(account.balance, currency)}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="finance-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Income</p>
            <p className="text-xl font-bold text-finance-positive">
              +{formatCurrency(summary.income, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Expenses</p>
            <p className="text-xl font-bold text-finance-negative">
              -{formatCurrency(summary.expenses, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Net</p>
            <p className={`text-xl font-bold ${summary.net >= 0 ? 'text-finance-positive' : 'text-finance-negative'}`}>
              {summary.net >= 0 ? '+' : ''}{formatCurrency(summary.net, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p className="text-xl font-bold">{summary.count}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="finance-card">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {defaultCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>From</Label>
                      <Input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>To</Label>
                      <Input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => setDateRange({ from: '', to: '' })}
                    >
                      Clear Dates
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {(searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || dateRange.from || dateRange.to) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                    setCategoryFilter('all');
                    setDateRange({ from: '', to: '' });
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedTransactions.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-primary/10 flex items-center justify-between"
            >
              <span className="text-sm font-medium">
                {selectedTransactions.size} transaction{selectedTransactions.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      Categorize
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {defaultCategories.slice(0, 10).map(cat => (
                      <DropdownMenuItem 
                        key={cat.id}
                        onClick={() => handleBulkCategorize(cat.id)}
                      >
                        {cat.icon} {cat.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setSelectedTransactions(new Set())}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="finance-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedTransactions.size === filteredTransactions.length && filteredTransactions.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Description</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Account</th>
                  <th className="p-4 text-right text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="p-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredTransactions.map((tx, index) => {
                    const TypeIcon = typeIcons[tx.type];
                    const category = getCategoryById(tx.category);
                    const account = sampleAccounts.find(a => a.id === tx.accountId);
                    
                    return (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                      >
                        <td className="p-4">
                          <Checkbox
                            checked={selectedTransactions.has(tx.id)}
                            onCheckedChange={() => toggleSelect(tx.id)}
                          />
                        </td>
                        <td className="p-4">
                          <span className="text-sm">
                            {new Date(tx.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[tx.type]}`}>
                              <TypeIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium">{tx.description}</p>
                              {tx.merchant && (
                                <p className="text-xs text-muted-foreground">{tx.merchant}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="gap-1">
                            <span>{category?.icon}</span>
                            {category?.name || tx.category}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">
                            {account?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className={`font-semibold ${
                            tx.type === 'income' 
                              ? 'text-finance-positive' 
                              : tx.type === 'expense' 
                                ? 'text-finance-negative' 
                                : ''
                          }`}>
                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                            {formatCurrency(Math.abs(tx.amount), currency)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedTransaction(tx);
                                setReceiptDialogOpen(true);
                              }}>
                                <Receipt className="w-4 h-4 mr-2" />
                                Add Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center">
              <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No transactions found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or add a new transaction.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Upload Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Receipt</DialogTitle>
            <DialogDescription>
              Attach a receipt image for "{selectedTransaction?.description}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload a photo of your receipt
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleReceiptUpload}
                className="max-w-xs mx-auto"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

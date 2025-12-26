import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Link2, 
  Shield, 
  ChevronRight, 
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Smartphone,
  CreditCard
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Bank {
  id: string;
  name: string;
  logo: string;
  color: string;
  popular: boolean;
}

const popularBanks: Bank[] = [
  { id: 'chase', name: 'Chase', logo: '🏦', color: '#117ACA', popular: true },
  { id: 'bofa', name: 'Bank of America', logo: '🏛️', color: '#012169', popular: true },
  { id: 'wells', name: 'Wells Fargo', logo: '🏦', color: '#D71E28', popular: true },
  { id: 'citi', name: 'Citibank', logo: '🏦', color: '#003B70', popular: true },
  { id: 'usbank', name: 'US Bank', logo: '🏦', color: '#D50032', popular: true },
  { id: 'capital', name: 'Capital One', logo: '💳', color: '#D03027', popular: true },
  { id: 'pnc', name: 'PNC Bank', logo: '🏦', color: '#F58025', popular: true },
  { id: 'td', name: 'TD Bank', logo: '🏦', color: '#54B948', popular: true },
];

const allBanks: Bank[] = [
  ...popularBanks,
  { id: 'schwab', name: 'Charles Schwab', logo: '📈', color: '#00A0DF', popular: false },
  { id: 'fidelity', name: 'Fidelity', logo: '📊', color: '#4AA73C', popular: false },
  { id: 'vanguard', name: 'Vanguard', logo: '⚓', color: '#96262C', popular: false },
  { id: 'amex', name: 'American Express', logo: '💳', color: '#006FCF', popular: false },
  { id: 'discover', name: 'Discover', logo: '💳', color: '#FF6600', popular: false },
  { id: 'ally', name: 'Ally Bank', logo: '🏦', color: '#5A287D', popular: false },
  { id: 'marcus', name: 'Marcus by Goldman', logo: '💰', color: '#000000', popular: false },
  { id: 'sofi', name: 'SoFi', logo: '💎', color: '#00D4BD', popular: false },
  { id: 'chime', name: 'Chime', logo: '📱', color: '#1EC677', popular: false },
  { id: 'coinbase', name: 'Coinbase', logo: '₿', color: '#0052FF', popular: false },
  { id: 'robinhood', name: 'Robinhood', logo: '🪶', color: '#00C805', popular: false },
  { id: 'paypal', name: 'PayPal', logo: '💸', color: '#003087', popular: false },
];

type ConnectionStep = 'select' | 'connecting' | 'credentials' | 'success' | 'error';

export default function BankConnectionDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ConnectionStep>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  const filteredBanks = allBanks.filter(bank => 
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setStep('connecting');
    
    // Simulate connection process
    setTimeout(() => {
      setStep('credentials');
    }, 1500);
  };

  const handleConnect = () => {
    setStep('connecting');
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep('select');
      setSelectedBank(null);
      setSearchQuery('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-primary hover:opacity-90">
          <Link2 className="w-4 h-4" />
          Connect Bank
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {step === 'select' && 'Connect Your Bank'}
            {step === 'connecting' && 'Connecting...'}
            {step === 'credentials' && `Connect to ${selectedBank?.name}`}
            {step === 'success' && 'Successfully Connected!'}
            {step === 'error' && 'Connection Failed'}
          </DialogTitle>
          <DialogDescription>
            {step === 'select' && 'Securely link your bank accounts to automatically sync transactions.'}
            {step === 'credentials' && 'Enter your credentials to connect your account.'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Security Badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Bank-level 256-bit encryption. We never store your credentials.
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search banks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Popular Banks */}
              {!searchQuery && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Popular Banks</p>
                  <div className="grid grid-cols-2 gap-2">
                    {popularBanks.map((bank) => (
                      <motion.button
                        key={bank.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectBank(bank)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-left"
                      >
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${bank.color}20` }}
                        >
                          {bank.logo}
                        </div>
                        <span className="font-medium truncate">{bank.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* All/Filtered Banks */}
              {searchQuery && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredBanks.map((bank) => (
                    <motion.button
                      key={bank.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectBank(bank)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${bank.color}20` }}
                      >
                        {bank.logo}
                      </div>
                      <span className="font-medium flex-1 text-left">{bank.name}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  ))}
                  {filteredBanks.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No banks found matching "{searchQuery}"
                    </p>
                  )}
                </div>
              )}

              {/* Manual Option */}
              <div className="pt-2 border-t border-border">
                <Button variant="ghost" className="w-full gap-2" onClick={handleClose}>
                  <Plus className="w-4 h-4" />
                  Add Account Manually Instead
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'connecting' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-12 flex flex-col items-center gap-4"
            >
              <div className="relative">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${selectedBank?.color}20` }}
                >
                  {selectedBank?.logo}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-medium">Connecting to {selectedBank?.name}</p>
                <p className="text-sm text-muted-foreground">This may take a moment...</p>
              </div>
            </motion.div>
          )}

          {step === 'credentials' && (
            <motion.div
              key="credentials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/50">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${selectedBank?.color}20` }}
                >
                  {selectedBank?.logo}
                </div>
                <div>
                  <p className="font-medium">{selectedBank?.name}</p>
                  <p className="text-sm text-muted-foreground">Enter your online banking credentials</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input placeholder="Enter your username" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input type="password" placeholder="Enter your password" />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Your credentials are encrypted and never stored on our servers.
                </span>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep('select')}>
                  Back
                </Button>
                <Button className="flex-1 bg-gradient-primary" onClick={handleConnect}>
                  Connect
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8 flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-16 h-16 rounded-full bg-finance-positive/20 flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-finance-positive" />
              </motion.div>
              <div className="text-center">
                <p className="text-lg font-medium">Successfully Connected!</p>
                <p className="text-sm text-muted-foreground">
                  Your {selectedBank?.name} account is now linked.
                </p>
              </div>
              <div className="w-full space-y-2 p-4 rounded-xl bg-accent/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Accounts found:</span>
                  <Badge variant="secondary">3 accounts</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Transactions synced:</span>
                  <Badge variant="secondary">Last 90 days</Badge>
                </div>
              </div>
              <Button className="w-full bg-gradient-primary" onClick={handleClose}>
                Done
              </Button>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8 flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-finance-negative/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-finance-negative" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">Connection Failed</p>
                <p className="text-sm text-muted-foreground">
                  We couldn't connect to your bank. Please try again.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => setStep('credentials')}>
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

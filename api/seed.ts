/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from './lib/dbConnect.js';
import User from './models/User.js';
import Account from './models/Account.js';
import Transaction from './models/Transaction.js';
import Budget from './models/Budget.js';
import Goal from './models/Goal.js';
import Debt from './models/Debt.js';

const sampleAccounts = [
  {
    name: 'Primary Checking',
    type: 'checking',
    balance: 8456.32,
    currency: 'USD',
    institution: 'Chase Bank',
    isManual: false,
    color: '#3B82F6',
    icon: '🏦',
  },
  {
    name: 'High-Yield Savings',
    type: 'savings',
    balance: 25000.00,
    currency: 'USD',
    institution: 'Marcus',
    isManual: false,
    color: '#10B981',
    icon: '💰',
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await dbConnect();

    if (req.query.clean === 'true') {
      await User.deleteMany({});
      await Account.deleteMany({});
      await Transaction.deleteMany({});
      await Budget.deleteMany({});
      await Goal.deleteMany({});
      await Debt.deleteMany({});
    }

    let user = await User.findOne({ email: 'user@example.com' });
    if (!user) {
      user = await User.create({
        email: 'user@example.com',
        name: 'Demo User',
        country: 'US',
        currency: 'USD',
        mode: 'salaried',
        onboardingComplete: true,
        password: 'password' 
      });
    }

    const userId = user._id;

    const existingAccounts = await Account.find({ userId });
    if (existingAccounts.length === 0) {
      await Account.insertMany(
        sampleAccounts.map(acc => ({ ...acc, userId }))
      );
    }

    res.status(200).json({ success: true, message: 'Database seeded successfully', userId });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

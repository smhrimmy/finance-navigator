/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from './lib/dbConnect.js';
import Transaction from './models/Transaction.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await dbConnect();
  const { userId } = req.query;

  if (req.method === 'GET') {
    if (!userId) return res.status(400).json({ success: false, message: 'UserId required' });
    try {
      const transactions = await Transaction.find({ userId } as any).sort({ date: -1 });
      res.status(200).json({ success: true, data: transactions });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const transaction = await Transaction.create(req.body);
      res.status(201).json({ success: true, data: transaction });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

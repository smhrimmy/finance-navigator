/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from './lib/dbConnect.js';
import Debt from './models/Debt.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await dbConnect();
  const { userId } = req.query;

  if (req.method === 'GET') {
    if (!userId) return res.status(400).json({ success: false, message: 'UserId required' });
    try {
      const debts = await Debt.find({ userId });
      res.status(200).json({ success: true, data: debts });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const debt = await Debt.create(req.body);
      res.status(201).json({ success: true, data: debt });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
        const { id, ...data } = req.body;
        const debt = await Debt.findByIdAndUpdate(id, data, { new: true });
        res.status(200).json({ success: true, data: debt });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
        const { id } = req.query;
        await Debt.findByIdAndDelete(id);
        res.status(200).json({ success: true });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

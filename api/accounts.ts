/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from './lib/dbConnect.js';
import Account from './models/Account.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await dbConnect();
  const { userId } = req.query;

  if (!userId && req.method === 'GET') {
      return res.status(400).json({ success: false, message: 'UserId required' });
  }

  if (req.method === 'GET') {
    try {
      const accounts = await Account.find({ userId });
      res.status(200).json({ success: true, data: accounts });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const account = await Account.create(req.body);
      res.status(201).json({ success: true, data: account });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

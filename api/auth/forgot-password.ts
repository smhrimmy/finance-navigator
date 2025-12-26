/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal user existence
      return res.status(200).json({ success: true, message: 'If an account exists, an email has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Mock Email
    console.log(`[Mock Email] Password reset requested for ${email}. Token: ${resetToken}`);
    console.log(`[Mock Link] http://localhost:3000/auth/reset-password?token=${resetToken}`);

    res.status(200).json({ success: true, message: 'If an account exists, an email has been sent.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

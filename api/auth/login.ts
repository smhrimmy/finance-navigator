/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';
import { verifyPassword, generateToken } from '../lib/auth-utils.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { email, password } = req.body;

    // Explicitly select password since it's set to select: false in schema
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if user has a password (legacy users might not if from mock?)
    if (!user.password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString());

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      data: user
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

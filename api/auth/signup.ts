/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';
import { hashPassword } from '../lib/auth-utils.js';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      verificationToken,
      isVerified: false,
      onboardingComplete: false
    });

    // Mock Email Sending
    console.log(`[Mock Email] Sending verification email to ${email}. Token: ${verificationToken}`);
    console.log(`[Mock Link] http://localhost:3000/auth/verify?token=${verificationToken}`);

    // Return token for immediate login (optional, but good for UX) or force verification
    // For this requirement "Email verification", we might want to force it? 
    // Usually, apps let you in but limit features. 
    // Let's just return success and ask to verify.
    
    res.status(201).json({ 
      success: true, 
      message: 'User created. Please check your email to verify your account.',
      data: {
          email: user.email,
          id: user._id
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

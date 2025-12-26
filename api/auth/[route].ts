/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../../lib/dbConnect.js';
import User from '../../models/User.js';
import { verifyPassword, generateToken, hashPassword, verifyToken } from '../../lib/auth-utils.js';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { route } = req.query;
  const action = Array.isArray(route) ? route[0] : route;

  await dbConnect();

  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res);
      case 'signup':
        return await handleSignup(req, res);
      case 'me':
        return await handleMe(req, res);
      case 'verify':
        return await handleVerify(req, res);
      case 'forgot-password':
        return await handleForgotPassword(req, res);
      case 'reset-password':
        return await handleResetPassword(req, res);
      default:
        return res.status(404).json({ success: false, message: 'Auth route not found' });
    }
  } catch (error: any) {
    console.error(`Auth error in ${action}:`, error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Explicitly select password since it's set to select: false in schema
  const user = await User.findOne({ email } as any).select('+password');

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
}

async function handleSignup(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const existingUser = await User.findOne({ email } as any);
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

  res.status(201).json({ 
    success: true, 
    message: 'User created. Please check your email to verify your account.',
    data: {
        email: user.email,
        id: user._id
    }
  });
}

async function handleMe(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({ success: true, data: user });
}

async function handleVerify(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
  }

  const user = await User.findOne({ verificationToken: token } as any);

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid token' });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.status(200).json({ success: true, message: 'Email verified successfully' });
}

async function handleForgotPassword(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email } = req.body;

  const user = await User.findOne({ email } as any);
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
}

async function handleResetPassword(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  } as any);

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successfully' });
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from './lib/dbConnect.js';
import User from './models/User.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    // Login or Register
    const { email, password } = req.body;
    
    try {
      let user = await User.findOne({ email });
      
      if (!user) {
        // Create new user if not exists (Auto-register for demo)
        user = await User.create({
          email,
          name: email.split('@')[0],
          password, // Note: In production, hash this!
          onboardingComplete: false
        });
      } else {
        // Check password (simple comparison for demo)
        if (user.password && user.password !== password) {
          return res.status(401).json({ success: false, message: 'Invalid password' });
        }
      }
      
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'GET') {
    const { email, id } = req.query;
    try {
      const query = id ? { _id: id } : { email };
      const user = await User.findOne(query);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'PUT') {
     const { id, ...updateData } = req.body;
     try {
       const user = await User.findByIdAndUpdate(id, updateData, { new: true });
       res.status(200).json({ success: true, data: user });
     } catch (error: any) {
       res.status(400).json({ success: false, error: error.message });
     }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, select: false }, // Hashed password, excluded by default
  verificationToken: { type: String },
  isVerified: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  country: { type: String, default: 'US' },
  currency: { type: String, default: 'USD' },
  mode: { type: String, enum: ['student', 'salaried', 'freelancer', 'family', 'business', 'retiree'], default: 'salaried' },
  createdAt: { type: Date, default: Date.now },
  onboardingComplete: { type: Boolean, default: false },
  preferences: {
    language: { type: String, default: 'en' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    numberFormat: { type: String, default: 'en-US' },
    firstDayOfWeek: { type: Number, default: 0 },
    theme: { type: String, default: 'dark' },
    notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        budget: { type: Boolean, default: true },
        bills: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: true },
        goals: { type: Boolean, default: true }
    },
    privacy: {
        twoFactorEnabled: { type: Boolean, default: false },
        dataSharing: { type: Boolean, default: false },
        analyticsEnabled: { type: Boolean, default: true }
    }
  }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);

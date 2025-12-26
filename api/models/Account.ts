import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  institution: String,
  lastSync: Date,
  isManual: { type: Boolean, default: true },
  color: String,
  icon: String
});

export default mongoose.models.Account || mongoose.model('Account', AccountSchema);

import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: String,
  type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
  isRecurring: { type: Boolean, default: false },
  tags: [String],
  notes: String,
  merchant: String,
  location: String
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

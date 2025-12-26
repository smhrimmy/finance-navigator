import mongoose from 'mongoose';

const DebtSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  originalAmount: { type: Number, required: true },
  currentBalance: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  minimumPayment: { type: Number, required: true },
  dueDay: { type: Number, required: true },
  lender: String,
  startDate: { type: Date, required: true },
  endDate: Date
});

export default mongoose.models.Debt || mongoose.model('Debt', DebtSchema);

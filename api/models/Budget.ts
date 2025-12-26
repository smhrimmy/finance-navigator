import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  period: { type: String, enum: ['weekly', 'monthly', 'yearly'], default: 'monthly' },
  categoryId: { type: String, required: true },
  rollover: { type: Boolean, default: false },
  alerts: {
    at50: { type: Boolean, default: false },
    at75: { type: Boolean, default: false },
    at90: { type: Boolean, default: false },
    atLimit: { type: Boolean, default: false }
  }
});

export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);

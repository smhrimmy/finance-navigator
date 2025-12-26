import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: Date,
  icon: String,
  color: String,
  type: { type: String, required: true },
  priority: { type: String, default: 'medium' },
  autoContribute: {
    amount: Number,
    frequency: String
  }
});

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);

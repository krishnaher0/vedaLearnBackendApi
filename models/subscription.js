const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  transactionId: String,
  amount: Number,
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETE', 'FAILED'],
    default: 'PENDING',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);

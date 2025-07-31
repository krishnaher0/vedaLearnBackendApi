const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: String,
  icon: String,
  xpReward: { type: Number, default: 0 },
  earnedAt: { type: Date, default: Date.now },
  isUnlocked: { type: Boolean, default: true },
  type: {
    type: String,
    enum: ["first_task", "streak", "task_count", "xp_milestone", "course_complete"],
  },
  progress: { type: Number, default: 0 }, // for in-progress achievements like task count
  goal: { type: Number }, // e.g. 50 tasks
});

module.exports = mongoose.model("Achievement", achievementSchema);

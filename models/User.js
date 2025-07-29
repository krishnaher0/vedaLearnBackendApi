const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    profileImage:{
      type:String,
      required:false,
    },
    role: {
      type: String,
      enum: ["Learner", "Admin", "Teacher"],
      default: "Learner",
    },
    subscribed: { type: Boolean, default: false },
    // 👇 NEW: Enrolled courses with progress tracking
    enrolledCourses: [
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lessonsCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    completed: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    enrolledAt: { type: Date, default: Date.now },
    
    // 👇 NEW
    questionProgress: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
        isCorrect: { type: Boolean, required: true },
        answeredAt: { type: Date, default: Date.now },
        userAnswer: String, // optional, if you want to store user's submitted value
      }
    ],
     totalCorrectQuestions: { type: Number, default: 0 },
    totalIncorrectQuestions: { type: Number, default: 0 },
  }
],
 playerStats: {
      xp: { type: Number, default: 0 },
      hearts: { type: Number, default: 5 },
      winningStreak: { type: Number, default: 0 },
      dayStreak: { type: Number, default: 0 },
      lastPlayed: { type: Date }
    }




  },

  
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

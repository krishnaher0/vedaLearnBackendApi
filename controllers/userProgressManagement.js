// const User = require("../../models/User");
// const bcrypt = require("bcrypt");
// exports.enrollCourse = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const { courseId } = req.body;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     const alreadyEnrolled = user.enrolledCourses.some(
//       (c) => c.course.toString() === courseId
//     );

//     if (alreadyEnrolled) {
//       return res.status(400).json({ success: false, message: "Already enrolled" });
//     }

//     user.enrolledCourses.push({
//       course: courseId,
//       lessonsCompleted: [],
//       score: 0,
//       enrolledAt: new Date(),
//     });

//     await user.save();

//     return res.status(200).json({ success: true, message: "Course enrolled successfully" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };
// exports.completeLesson = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const { courseId, lessonId } = req.body;

//     const user = await User.findOneAndUpdate(
//       { _id: userId, "enrolledCourses.course": courseId },
//       { $addToSet: { "enrolledCourses.$.lessonsCompleted": lessonId } },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User or course not found" });
//     }

//     return res.status(200).json({ success: true, message: "Lesson marked as completed" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };
// exports.updateScore = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const { courseId, scoreToAdd } = req.body;

//     const user = await User.findOneAndUpdate(
//       { _id: userId, "enrolledCourses.course": courseId },
//       { $inc: { "enrolledCourses.$.score": scoreToAdd } },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User or course not found" });
//     }

//     return res.status(200).json({ success: true, message: "Score updated", data: user });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };
// exports.submitAnswer = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const { courseId, questionId, userAnswer } = req.body;

//     const question = await Question.findById(questionId);
//     if (!question) return res.status(404).json({ success: false, message: "Question not found" });

//     let isCorrect = false;
//     if (question.questionType === "Translation") {
//       isCorrect = question.targetTranslation.trim().toLowerCase() === userAnswer.trim().toLowerCase();
//     } else if (question.questionType === "MultipleChoice") {
//       isCorrect = question.correctAnswer === userAnswer;
//     } else if (question.questionType === "FillInTheBlank") {
//       isCorrect = question.correctAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
//     }
//     // etc...

//     const user = await User.findOneAndUpdate(
//       { _id: userId, "enrolledCourses.course": courseId },
//       {
//         $push: {
//           "enrolledCourses.$.questionProgress": {
//             question: questionId,
//             isCorrect,
//             userAnswer,
//           },
//         },
//         $inc: {
//           "enrolledCourses.$.score": isCorrect ? 1 : 0,
//         },
//       },
//       { new: true }
//     );

//     return res.status(200).json({ success: true, isCorrect, data: user });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// const User=require("../models/User")
// // Controller
// exports.updateUserProgress = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { questionId, isCorrect, userAnswer, lessonId } = req.body;

//     const user = await User.findById(id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const enrolledCourse = user.enrolledCourses.find(ec =>
//       ec.course.toString() === req.body.courseId
//     );

//     if (!enrolledCourse) {
//       return res.status(400).json({ message: "User not enrolled in this course" });
//     }

//     // Avoid duplicate question
//     const alreadyAnswered = enrolledCourse.questionProgress.some(
//       (q) => q.question.toString() === questionId
//     );
//     if (!alreadyAnswered) {
//       enrolledCourse.questionProgress.push({ question: questionId, isCorrect, userAnswer });
//     }

//     // Mark lesson complete if last question
//     if (!enrolledCourse.lessonsCompleted.includes(lessonId)) {
//       enrolledCourse.lessonsCompleted.push(lessonId);
//     }

//     await user.save();
//     res.status(200).json({ success: true, message: "Progress updated" });
//   } catch (err) {
//     console.error("Progress update error:", err);
//     res.status(500).json({ success: false });
//   }
// };

const User = require("../models/User");
const Lesson = require("../models/lessonModel");
const Question = require("../models/questionModel");
const mongoose = require("mongoose");

// 🧠 Utility to get today's date (used for streak tracking)
const getToday = () => new Date().toISOString().split("T")[0];

exports.updateProgress = async (req, res) => {
  try {
    const { userId, lessonId, questionId, isCorrect, userAnswer } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(lessonId) ||
        !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const enrolled = user.enrolledCourses.find((ec) => ec.course && ec.course.toString() === req.body.courseId);
    if (!enrolled) return res.status(404).json({ success: false, message: "Course not enrolled" });

    // Prevent duplicate progress entries
    const alreadyAnswered = enrolled.questionProgress.find((qp) => qp.question.toString() === questionId);
    if (!alreadyAnswered) {
      enrolled.questionProgress.push({ question: questionId, isCorrect, userAnswer });
    }

    // ✅ Update XP and hearts
    if (isCorrect) {
      user.playerStats.xp += 5; // optional: per-question XP
    } else {
      user.playerStats.hearts = Math.max(0, user.playerStats.hearts - 1);
    }

    // ✅ Mark lesson complete and give lesson XP only once
    if (!enrolled.lessonsCompleted.includes(lessonId)) {
      enrolled.lessonsCompleted.push(lessonId);
      user.playerStats.xp += 10; // lesson complete XP
    }

    // ✅ Day streak and winning streak
    const today = getToday();
    const lastPlayed = user.playerStats.lastPlayed ? getToday(user.playerStats.lastPlayed) : null;

    if (lastPlayed !== today) {
      user.playerStats.dayStreak += 1;
      user.playerStats.winningStreak += 1;
      user.playerStats.lastPlayed = new Date();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Progress updated",
      stats: user.playerStats,
      questionProgress: enrolled.questionProgress,
    });
  } catch (err) {
    console.error("Error updating progress:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("enrolledCourses.course")
      .populate("enrolledCourses.lessonsCompleted")
      .populate("enrolledCourses.questionProgress.question");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      progress: user.enrolledCourses,
      stats: user.playerStats,
    });
  } catch (err) {
    console.error("Error fetching user progress:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


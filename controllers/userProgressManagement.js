const User = require("../models/User")
const bcrypt = require("bcrypt");
const Lesson = require("../models/lessonModel");
const { Question } = require("../models/questionModel");
const mongoose = require("mongoose");

const Course = require("../models/courseModel");
exports.enrollCourse = async (req, res,next) => {
  try {
    const userId = req.params.id;
    const { courseId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

   const courseStr = req.body.courseId?.toString(); // make sure it's string
const alreadyEnrolled = user.enrolledCourses.some(
  (c) => c.course?.toString() === courseStr
);

    if (alreadyEnrolled) {
      // Do nothing, just return success
      return res.status(200).json({ success: true, message: "Already enrolled" });
    }

    user.enrolledCourses.push({
      course: courseId,
      lessonsCompleted: [],
      score: 0,
      enrolledAt: new Date(),
    });

    await user.save();

    return res.status(200).json({ success: true, message: "Course enrolled successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.completeLesson = async (req, res) => {
  try {
    const userId = req.params.id;
    const { courseId, lessonId } = req.body;

    // Step 1: Add lesson to lessonsCompleted
    const user = await User.findOneAndUpdate(
      { _id: userId, "enrolledCourses.course": courseId },
      { $addToSet: { "enrolledCourses.$.lessonsCompleted": lessonId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User or course not found" });
    }

    // Step 2: Get all lessons of the course
    const course = await Course.findById(courseId).select("lesson");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const allLessonIds = course.lesson.map(id => id.toString());

    // Step 3: Get the enrolled course record from the user
    const enrolledCourse = user.enrolledCourses.find(ec => ec.course.toString() === courseId);

    const completedLessonIds = (enrolledCourse?.lessonsCompleted || []).map(id => id.toString());

    // Step 4: Check if all lessons are completed
    const allCompleted = allLessonIds.every(id => completedLessonIds.includes(id));

    if (allCompleted && !enrolledCourse.completed) {
      // Step 5: Mark course as completed
      await User.updateOne(
        { _id: userId, "enrolledCourses.course": courseId },
        { $set: { "enrolledCourses.$.completed": true } }
      );
    }

    return res.status(200).json({
      success: true,
      message: allCompleted
        ? "Lesson marked as completed. Course also marked as completed."
        : "Lesson marked as completed.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



// 🧠 Utility to get today's date (used for streak tracking)
const getToday = () => new Date().toISOString().split("T")[0];

// ✅ Utility function to check correctness
const checkAnswerCorrectness = (question, userAnswer) => {
  switch (question.questionType) {
    case "Translation":
    case "Listening":
    case "FillInTheBlank":
      return question.correctAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
    case "MultipleChoice":
      return question.correctAnswer === userAnswer;
    case "TrueFalse":
      return question.correctAnswer === (userAnswer === "true" || userAnswer === true);
    case "Ordering":
      if (!Array.isArray(userAnswer) || !Array.isArray(question.correctOrder)) return false;
      const normalize = (arr) => arr.map((item) => item.trim().toLowerCase());
      return JSON.stringify(normalize(userAnswer)) === JSON.stringify(normalize(question.correctOrder));
    case "MatchingPairs":
      if (!Array.isArray(userAnswer) || !Array.isArray(question.pairs)) return false;
      const sortPairs = (pairs) =>
        pairs
          .map((p) => ({ left: p.left.trim().toLowerCase(), right: p.right.trim().toLowerCase() }))
          .sort((a, b) => a.left.localeCompare(b.left));
      const sortedUser = sortPairs(userAnswer);
      const sortedCorrect = sortPairs(question.pairs);
      return JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
    default:
      return false;
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { userId, courseId, lessonId, questionId, userAnswer } = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(lessonId) ||
      !mongoose.Types.ObjectId.isValid(questionId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    // Fetch question
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    // Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Find enrolled course
    const enrolled = user.enrolledCourses.find((ec) => ec.course && ec.course.toString() === courseId);
    if (!enrolled) return res.status(404).json({ success: false, message: "Course not enrolled" });

    // Check correctness
    const isCorrect = checkAnswerCorrectness(question, userAnswer);

    // Prevent duplicate progress
    const alreadyAnswered = enrolled.questionProgress.find((qp) => qp.question.toString() === questionId);
    if (!alreadyAnswered) {
      enrolled.questionProgress.push({ question: questionId, isCorrect, userAnswer });
    }

    // ✅ Update XP and hearts
    if (isCorrect) {
      user.playerStats.xp += 5; // per-question XP
    } else {
      user.playerStats.hearts = Math.max(0, user.playerStats.hearts - 1);
    }

    // ✅ Mark lesson complete and give lesson XP only once
   if (!enrolled.lessonsCompleted.includes(lessonId)) {
  enrolled.lessonsCompleted.push(lessonId);
  user.playerStats.xp += 10; // lesson complete XP

  // ✅ Check if all course lessons are now completed
  const course = await Course.findById(courseId).select("lesson");
  const allLessonIds = course.lesson.map(id => id.toString());
  const completedLessonIds = enrolled.lessonsCompleted.map(id => id.toString());

  const allCompleted = allLessonIds.every(id => completedLessonIds.includes(id));

  if (allCompleted) {
    enrolled.completed = true;
  }
}
const totalCorrect = enrolled.questionProgress.filter(qp => qp.isCorrect === true).length;
    const totalIncorrect = enrolled.questionProgress.filter(qp => qp.isCorrect === false).length;

    enrolled.totalCorrectQuestions = totalCorrect;    // add these fields in your User schema enrolledCourses
    enrolled.totalIncorrectQuestions = totalIncorrect;

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
      isCorrect,
      message: "Progress updated",
      stats: user.playerStats,
      questionProgress: enrolled.questionProgress,
      totalCorrect,
      totalIncorrect,
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

 // Assuming you have this

exports.getCourseStats = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid Course ID" });
    }

    // 1. Total enrolled users
    const totalEnrolled = await User.countDocuments({ "enrolledCourses.course": courseId });

    // 2. Get all users enrolled in this course with completed lessons
    const enrolledUsers = await User.find(
      { "enrolledCourses.course": courseId },
      { enrolledCourses: 1 }
    );

    // 3. Get total lessons in this course
    const totalLessons = await Lesson.countDocuments({ course: courseId });

    // 4. Calculate total lessons completed & users who completed the course
    let totalLessonsCompleted = 0;
    let totalUsersCompletedCourse = 0;
    

    for (const user of enrolledUsers) {
      const ec = user.enrolledCourses.find(
        (c) => c.course.toString() === courseId
      );
      const completed = ec?.lessonsCompleted?.length || 0;
      totalLessonsCompleted += completed;

      if (completed === totalLessons && totalLessons > 0) {
        totalUsersCompletedCourse += 1;
      }
    }
    const averageLessonCompletedPerUser = totalEnrolled > 0 ? (totalLessonsCompleted / totalEnrolled).toFixed(2) : 0;


    const completionRate = totalEnrolled
      ? ((averageLessonCompletedPerUser / totalLessons) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalEnrolled,
        totalLessons,
        totalLessonsCompleted,
        totalUsersCompletedCourse,
        averageLessonCompletedPerUser,
        completionRate: parseFloat(completionRate),
      },
    });
  } catch (err) {
    console.error("Error getting course stats:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getAllCourseEnrollmentStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $unwind: "$enrolledCourses" },
      {
        $group: {
          _id: "$enrolledCourses.course", // group by course ID
          totalEnrolled: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },
      {
        $project: {
          _id: 0,
          courseId: "$course._id",
          language: "$course.language",
          totalEnrolled: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error("Error getting course enrollment stats:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



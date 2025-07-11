const mongoose = require('mongoose');
const {
  Question,
  Translation,
  MultipleChoice,
  Listening,
  FillInTheBlank,
  MatchingPairs,
  TrueFalse,
  Ordering
  // Add more when you define them
} = require('../../models/questionModel');
const QuestionModel=require("../../models/questionModel")



exports.createQuestion = async (req, res) => {
   try {
    const { questionType, ...data } = req.body;

    // Normalize fields to arrays
   ["choices", "pairs", "items", "correctOrder"].forEach((field) => {
  if (data[field]) {
    try {
      data[field] = JSON.parse(data[field]);
    } catch (err) {
      console.warn(`Failed to parse ${field}:`, err);
    }
  }
});

    const typeModelMap = {
      Translation,
      MultipleChoice,
      Listening,
      FillInTheBlank,
      MatchingPairs,
      Ordering,
      TrueFalse,
    };

    const Model = typeModelMap[questionType];
    if (!Model) {
      return res.status(400).json({ success: false, message: `Unsupported question type: ${questionType}` });
    }


    if (!mongoose.Types.ObjectId.isValid(data.lesson)) {
      return res.status(400).json({ success: false, message: "Invalid lesson ID" });
    }

    // Add uploaded file URL if relevant
    if (req.file) {
      data.audioUrl = `/uploads/${req.file.filename}`;
      console.log("Received file:", req.file);
console.log("Request body:", req.body);

    }


    const newQuestion = await Model.create(data);

    res.status(201).json({ success: true, data: newQuestion });
  } catch (err) {
    console.log(req.body)
    console.error("Error creating question:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.addManyQuestions = async (req, res) => {
  try {
    const questions = req.body; // expect array of question objects
    await Question.insertMany(questions);
    res.status(200).json({
      success: true,
      message: "Questions added successfully!"
    });
  } catch (err) {
    console.error("Error adding questions:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.createQuestionsBatch = async (req, res) => {
  try {
    const questions = req.body;
    if (!Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: "Data should be an array." });
    }

    const createdQuestions = [];

    for (const question of questions) {
      const { questionType, ...data } = question;
      let newQuestion;

      switch (questionType) {
        case 'Translation':
          newQuestion = await Translation.create({ questionType, ...data });
          break;
        case 'MultipleChoice':
          newQuestion = await MultipleChoice.create({ questionType, ...data });
          break;
        case 'Listening':
          newQuestion = await Listening.create({ questionType, ...data });
          break;
        case 'FillInTheBlank':
          newQuestion = await FillInTheBlank.create({ questionType, ...data });
          break;
        case 'MatchingPairs':
          newQuestion = await MatchingPairs.create({ questionType, ...data });
          break;
        case 'Ordering':
          newQuestion = await Ordering.create({ questionType, ...data });
          break;
        case 'TrueFalse':
          newQuestion = await TrueFalse.create({ questionType, ...data });
          break;
        default:
          return res.status(400).json({ success: false, message: `Unsupported question type: ${questionType}` });
      }

      createdQuestions.push(newQuestion);
    }

    res.status(201).json({ success: true, data: createdQuestions });
  } catch (err) {
    console.error("Error creating questions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// 🟡 GET ALL (with optional filter)
exports.getQuestions = async (req, res) => {
  const { courseId, lessonId, type } = req.query;
  const filter = {};

  if (courseId) filter.course = courseId;
  if (lessonId) filter.lesson = lessonId;
  if (type) filter.questionType = type;

  try {
    const questions = await Question.find()
      .populate("course")
      .populate("lesson")
      .lean();
    res.status(200).json({ success: true, data: questions });
  } catch (err) {
    console.error("Error getting questions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔵 GET ONE
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, data: question });
  } catch (err) {
    console.error("Error getting question:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.updateQuestion = async (req, res) => {
  try {
    const { questionType, ...data } = req.body;

    // Parse stringified fields if present
    ["choices", "pairs", "items", "correctOrder"].forEach((field) => {
      if (data[field]) {
        try {
          data[field] = JSON.parse(data[field]);
        } catch (err) {
          console.warn(`Failed to parse ${field}:`, err);
        }
      }
    });

    // Map question types to models
    const typeModelMap = {
      Translation,
      MultipleChoice,
      Listening,
      FillInTheBlank,
      MatchingPairs,
      Ordering,
      TrueFalse,
    };

    const Model = typeModelMap[questionType];
    if (!Model) {
      return res.status(400).json({
        success: false,
        message: `Unsupported question type: ${questionType}`,
      });
    }

    // Add audio URL if new file uploaded
    if (req.file) {
      data.audioUrl = `/uploads/${req.file.filename}`;
      console.log("Updated file:", req.file);
    }

    const questionId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ success: false, message: "Invalid question ID" });
    }

    const updated = await Model.findByIdAndUpdate(questionId, data, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating question:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// 🔴 DELETE
exports.deleteQuestion = async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, message: "Question deleted" });
  } catch (err) {
    console.error("Error deleting question:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getQuestionsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params; // ✅ Correct: get from URL params

    if (!lessonId) {
      return res.status(400).json({ success: false, message: "lessonId is required" });
    }

    const questions = await Question.find({ lesson: lessonId }).lean(); // ✅ Query by lesson

    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (err) {
    console.error("Error getting questions by lesson:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteAllQuestions = async (req, res) => {
  try {
    await Question.deleteMany();
    res.status(200).json({ success: true, message: "All questions deleted" });
  } catch (err) {
    console.error("Error deleting all questions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




const {
  Question,
  Translation,
  MultipleChoice,
  // Add more when you define them
} = require('../../models/questionModel');

// 🔵 CREATE
exports.createQuestion = async (req, res) => {
  try {
    const { questionType, ...data } = req.body;

    let newQuestion;

    switch (questionType) {
      case 'Translation':
        newQuestion = await Translation.create({ questionType, ...data });
        break;

      case 'MultipleChoice':
        newQuestion = await MultipleChoice.create({ questionType, ...data });
        break;

      // TODO: Add other types
      default:
        return res.status(400).json({
          success: false,
          message: `Unsupported question type: ${questionType}`
        });
    }

    res.status(201).json({ success: true, data: newQuestion });
  } catch (err) {
    console.error("Error creating question:", err);
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
    const questions = await Question.find(filter).lean();
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

// 🟠 UPDATE
exports.updateQuestion = async (req, res) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });

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

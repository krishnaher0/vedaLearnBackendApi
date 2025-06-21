const mongoose = require('mongoose');

const baseOptions = {
  discriminatorKey: 'questionType',
  collection: 'questions',
  timestamps: true,
};

const questionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  questionType: { type: String, required: true },
  prompt: { type: String },
}, baseOptions);

const Question = mongoose.model('Question', questionSchema);

// Translation
const Translation = Question.discriminator('Translation', new mongoose.Schema({
  sourceSentence: String,
  targetTranslation: String,
}));

// Multiple Choice
const MultipleChoice = Question.discriminator('MultipleChoice', new mongoose.Schema({
  question: String,
  choices: [String],
  correctAnswer: String,
}));

// More discriminators here...

module.exports = {
  Question,
  Translation,
  MultipleChoice,
  // other exports...
};
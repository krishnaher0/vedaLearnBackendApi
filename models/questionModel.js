const mongoose = require('mongoose');

const baseOptions = {
  discriminatorKey: 'questionType',
  collection: 'questions',
  timestamps: true,
};

const questionSchema = new mongoose.Schema({
  // course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  questionType: { type: String, required: true,index: true },
  prompt: { type: String },
}, baseOptions);

const Question = mongoose.model('Question', questionSchema);

// Translation
const Translation = Question.discriminator('Translation', new mongoose.Schema({
  question: { type: String, required: true },
  audioUrl: { type: String, required: true }, 
  choices: [String],
  correctAnswer: { type: String, required: true },
}));


const MultipleChoice = Question.discriminator('MultipleChoice', new mongoose.Schema({
  question: { type: String, required: true },
  choices: [String],
  correctAnswer: { type: String, required: true },
  audioUrl: { type: String, required: true }, 
}));


// Listening (audio question)
const Listening = Question.discriminator('Listening', new mongoose.Schema({
  audioUrl: { type: String, required: true },  // URL to audio file
  correctAnswer: { type: String, required: true },   
  choices: [String],                        // Correct transcript
}));

// Fill in the blank
const FillInTheBlank = Question.discriminator('FillInTheBlank', new mongoose.Schema({
  sentenceWithBlank: { type: String, required: true }, // e.g. "I ___ to school."
  correctAnswer: { type: String, required: true },
  choices: [String],
}));

// Matching Pairs (match words with translations)
const MatchingPairs = Question.discriminator('MatchingPairs', new mongoose.Schema({
  pairs: [{
    left: String,
    right: String,
  }],
}));

// Ordering (put words or sentences in correct order)
const Ordering = Question.discriminator('Ordering', new mongoose.Schema({
  items: [String],           // shuffled list of items
  correctOrder: [String],   // correct sequence
}));

// True/False
const TrueFalse = Question.discriminator('TrueFalse', new mongoose.Schema({
   question: { type: String, required: true },
  correctAnswer: { type: Boolean, required: true },
  audioUrl: { type: String, required: true }, 
}));

// More discriminators here...

module.exports = {
  Question,
  Translation,
  MultipleChoice,
    Listening,
  FillInTheBlank,
  MatchingPairs,
  Ordering,
  TrueFalse,
  // other exports...
};
const mongoose = require('mongoose');

const learningSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['audio', 'video'],
    required: true,
  },
  mediaUrl: {
    type: String,
    required: true,
  },
  textContent: String
}, { timestamps: true });

module.exports = mongoose.model('Learning', learningSchema);

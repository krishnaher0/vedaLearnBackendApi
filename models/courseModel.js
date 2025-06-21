// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  language: { type: String, required: true },
  description: { type: String ,required:true},
  flagPath:{type:String}
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);

//model/entity for course works as a backend validation for key
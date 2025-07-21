// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminUserRoutes = require('./routes/admin/adminUserRoute');
const adminTeacherRoutes = require('./routes/admin/adminTeacherRoute');
const adminCourseRoutes = require('./routes/admin/adminCourseRoute');
const adminLessonRoutes = require('./routes/admin/adminLessonRoutes');
const adminQuestionRoutes = require('./routes/admin/adminQuestionRoutes');
const userProgressRoutes = require('./routes/userprogressRoutes');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/auths", teacherRoutes);
app.use("/api/admin/user", adminUserRoutes);
app.use("/api/user/progress", userProgressRoutes);
app.use("/api/admin/teacher", adminTeacherRoutes);
app.use("/api/admin/courses", adminCourseRoutes);
app.use("/api/admin/lessons", adminLessonRoutes);
app.use("/api/admin/questions", adminQuestionRoutes);


app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    console.error("Multer Error:", err.message);
    return res.status(400).json({ success: false, msg: err.message });
  } else if (err) {
    // An unknown error occurred (e.g., from fileFilter, or other non-Multer errors)
    console.error("Generic Error (from app.js middleware):", err.stack);
    return res.status(500).json({ success: false, msg: "Something broke!" });
  }
  next();
});

// Generic fallback error handling middleware (for uncaught errors not handled by MulterError)
// This should be the very last middleware
app.use((err, req, res, next) => {
  console.error("Fallback Error (from app.js final middleware):", err.stack);
  res.status(500).send('Something broke!');
});
module.exports = app;

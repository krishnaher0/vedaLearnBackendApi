// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); // Required for multer error checking

const userRoutes = require('./routes/userRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminUserRoutes = require('./routes/admin/adminUserRoute');
const adminTeacherRoutes = require('./routes/admin/adminTeacherRoute');
const adminCourseRoutes = require('./routes/admin/adminCourseRoute');
const adminLessonRoutes = require('./routes/admin/adminLessonRoutes');
const adminQuestionRoutes = require('./routes/admin/adminQuestionRoutes');
const userProgressRoutes = require('./routes/userprogressRoutes');
const learningRoutes = require('./routes/admin/learningRoute');
const subscriptionRoutes = require('./routes/subscriptionRoute');
const planRoutes = require('./routes/planRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
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
app.use("/api/admin/learnings", learningRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/plan", planRoutes);

// Error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer Error:", err.message);
    return res.status(400).json({ success: false, msg: err.message });
  } else if (err) {
    console.error("Unhandled Error:", err.stack);
    return res.status(500).json({ success: false, msg: "Something broke!" });
  }
  next();
});

module.exports = app;

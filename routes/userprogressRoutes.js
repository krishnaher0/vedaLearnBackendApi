const express = require("express");
const userProgressManagement = require("../controllers/userProgressManagement");
const router = express.Router();


// Update user progress after answering a question
router.post("/:id/enroll-course", userProgressManagement.enrollCourse);
router.post("/:id/complete-lesson", userProgressManagement.completeLesson);
router.post("/:id/update-progress", userProgressManagement.updateProgress);
router.post("/", userProgressManagement.updateProgress);

router.get("/courses/:courseId/stats", userProgressManagement.getCourseStats);
// GET total enrolled users per course
router.get("/:userId/enrolled-courses", userProgressManagement.getEnrolledCourses); 
router.get("/:userId/", userProgressManagement.getUserProgress); 


router.get("/courses/stats/all", userProgressManagement.getAllCourseEnrollmentStats);


// (Optional) Get full progress for a specific user


module.exports = router;

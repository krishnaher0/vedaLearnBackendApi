const express = require("express");
const userProgressManagement = require("../controllers/userProgressManagement");
const router = express.Router();


// Update user progress after answering a question
router.post("/:id/enroll-course", userProgressManagement.enrollCourse);
router.post("/:id/complete-lesson", userProgressManagement.completeLesson);
router.post("/:id/update-progress", userProgressManagement.updateProgress);
router.post("/", userProgressManagement.updateProgress);



// (Optional) Get full progress for a specific user
router.get("/:userId/", userProgressManagement.getUserProgress); 
module.exports = router;

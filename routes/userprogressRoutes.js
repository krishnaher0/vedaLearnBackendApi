const express = require("express");
const userProgressManagement = require("../controllers/userProgressManagement");
const router = express.Router();


// Update user progress after answering a question
router.post("/", userProgressManagement.updateProgress);

// (Optional) Get full progress for a specific user
router.get("/:userId/", userProgressManagement.getUserProgress); 
module.exports = router;

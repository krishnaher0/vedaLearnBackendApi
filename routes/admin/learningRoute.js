const express = require("express");
const router = express.Router();
const learningController = require("../../controllers/admin/learningController");
const upload = require("../../middlewares/fileUpload").single("mediaUrl"); // adjust path & fieldname

// Route to upload a learning with a single media file (audio/video)
router.post("/", upload, learningController.uploadLearningWithFile);

// Route to get all learnings, optional filtering by course with query param
router.get("/", learningController.getAllLearnings);
router.get("/:courseId", learningController.getLearningsByCourse);

module.exports = router;

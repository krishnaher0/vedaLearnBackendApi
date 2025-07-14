const express = require('express');
const router = express.Router();
const upload = require("../../middlewares/fileUpload")
const controller = require('../../controllers/admin/questionManagement');

router.post('/', upload.single('audioUrl'), controller.createQuestion);
router.get('/', controller.getQuestions);
router.get('/:id', controller.getQuestionById);
router.get('/lesson/:lessonId', controller.getQuestionsByLesson);
router.get('/lesson/:lessonId/index/:questionIndex', controller.getQuestionByLessonAndIndex);
router.put('/:id', upload.single('audioUrl'), controller.updateQuestion);
router.delete("/many",controller.deleteAllQuestions)
router.delete('/:id', controller.deleteQuestion);
router.post("/many",controller.addManyQuestions)

// router.post("/all",controller.createQuestionsBatch)


module.exports = router;

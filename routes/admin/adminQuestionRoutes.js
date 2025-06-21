const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/questionManagement');

router.post('/', controller.createQuestion);
router.get('/', controller.getQuestions);
router.get('/:id', controller.getQuestionById);
router.put('/:id', controller.updateQuestion);
router.delete('/:id', controller.deleteQuestion);

module.exports = router;

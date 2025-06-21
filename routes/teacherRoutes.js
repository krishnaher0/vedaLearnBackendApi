const express = require("express");
const { registerTeacher,loginTeacher } = require("../controllers/teacherController");
const router = express.Router();
const upload = require('../middlewares/fileUpload')
 
 
router.post("/register/teacher", upload.single('cvImage'), registerTeacher)//navigate to the register api
router.post("/login/teacher", loginTeacher) //navigate to login 
 
module.exports = router;

const express = require('express');
const router = express.Router();
const {getAllLessons,getLessonById,updateLesson,deleteLesson, addLesson,getLessonsByCourse} = require('../../controllers/admin/lessonManagement');
const {authenticateUser,isAdmin, isAdminOrTeacher}=require("../../middlewares/authorizedUser")
// can be implemented using single import
// const upload = require("../../middlewares/fileUpload")

router.post(
    '/',
    authenticateUser,
    isAdmin,
    addLesson
);

router.get("/",
    authenticateUser,
    
   
    getAllLessons
   
);
router.get("/course/:courseId",
    
    
   
    getLessonsByCourse
   

);
router.get("/:id",
    authenticateUser,
    
    getLessonById
   

)
router.put("/:id",
    authenticateUser,
    isAdminOrTeacher,
    updateLesson
   

)
router.delete("/:id",
    authenticateUser,
    isAdminOrTeacher,
    deleteLesson
   

)
module.exports=router
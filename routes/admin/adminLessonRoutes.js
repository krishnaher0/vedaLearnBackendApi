const express = require('express');
const router = express.Router();
const {getAllLessons,getLessonById,updateLesson,deleteLesson, addLesson,getLessonsByCourse} = require('../../controllers/admin/lessonManagement');
const {authenticateUser,isAdmin}=require("../../middlewares/authorizedUser")
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
    authenticateUser,
   
    getLessonsByCourse
   

);
router.get("/:id",
    authenticateUser,
    
    getLessonById
   

)
router.put("/:id",
    authenticateUser,
    isAdmin,
    updateLesson
   

)
router.delete("/:id",
    authenticateUser,
    isAdmin,
    deleteLesson
   

)
module.exports=router
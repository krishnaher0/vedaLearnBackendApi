const express = require('express');
const router = express.Router();
const {getAllLessons,getLessonById,updateLesson,deleteLesson, addLesson} = require('../../controllers/admin/lessonManagement');
const {authenticateUser,isAdmin}=require("../../middlewares/authorizedUser")
// can be implemented using single import
// const upload = require("../../middlewares/fileUpload")

// implement using dot function
router.post(
    '/',
    authenticateUser,
    isAdmin,
    addLesson
);

router.get("/getall/",
    authenticateUser,
    isAdmin,
    getAllLessons
   

);
router.get("/get/:id",
    authenticateUser,
    isAdmin,
    getLessonById
   

)
router.put("/update/:id",
    authenticateUser,
    isAdmin,
    updateLesson
   

)
router.delete("/delete/:id",
    authenticateUser,
    isAdmin,
    deleteLesson
   

)
module.exports=router
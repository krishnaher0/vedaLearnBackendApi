const express = require('express');
const router = express.Router();
const {createCourse,getAllCourses,getCourseById,updateCourse,deleteCourse} = require('../../controllers/admin/courseManagement');
const {authenticateUser,isAdmin, isAdminOrTeacher}=require("../../middlewares/authorizedUser")
// can be implemented using single import
const upload = require("../../middlewares/fileUpload")

// implement using dot function
router.post(
    '/',
    authenticateUser,
    isAdminOrTeacher,
    upload.single("flagPath"),
    createCourse
);
router.get("/",
    authenticateUser,
    
    getAllCourses
   

)
router.get("/:id",
    authenticateUser,
    
    getCourseById
   

)
router.put("/:id",
    authenticateUser,
    isAdmin,
    upload.single("flagPath"),
    updateCourse
   

)
router.delete("/:id",
    authenticateUser,
    isAdmin,
    deleteCourse
   

)
module.exports=router
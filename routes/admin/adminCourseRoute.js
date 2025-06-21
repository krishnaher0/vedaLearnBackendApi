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
router.get("/getall/",
    authenticateUser,
    isAdmin,
    getAllCourses
   

)
router.get("/get/:id",
    authenticateUser,
    isAdmin,
    getCourseById
   

)
router.put("/update/:id",
    authenticateUser,
    isAdmin,
    updateCourse
   

)
router.delete("/delete/:id",
    authenticateUser,
    isAdmin,
    deleteCourse
   

)
module.exports=router
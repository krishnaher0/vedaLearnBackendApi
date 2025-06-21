const express = require("express")
const router = express.Router()
const upload = require('../../middlewares/fileUpload')

const { isAdmin, authenticateUser } = require("../../middlewares/authorizedUser")
const { getTeachers, getOneTeacher, updateOneTeacher, deleteOneTeacher } = require("../../controllers/admin/teacherManagement")
// const { authenticateTeacher } = require("../../middlewares/authorizedTeacher")



router.get(
    "/",
    authenticateUser,//validate as a user
    isAdmin, //check role as an admin
    getTeachers// get all teachers
)

router.get(
    "/:id", // req.params.id
    getOneTeacher// get teacher by id
)

router.put("/:id", upload.single("cvImage"), updateOneTeacher);//update teacher with his/her cv

router.delete(
    "/:id", // req.params.id
    deleteOneTeacher//delete teacher by automatically fetching id
)

module.exports = router

const express = require("express")
const router = express.Router()
const upload = require('../../middlewares/fileUpload')

const { isAdmin, authenticateUser } = require("../../middlewares/authorizedUser")
const { getTeachers, getOneTeacher, updateOneTeacher, deleteOneTeacher } = require("../../controllers/admin/teacherManagement")
// const { authenticateTeacher } = require("../../middlewares/authorizedTeacher")



router.get(
    "/",
    authenticateUser,
    isAdmin,
    getTeachers
)

router.get(
    "/:id", // req.params.id
    getOneTeacher
)

router.put("/:id", upload.single("cvImage"), updateOneTeacher);

router.delete(
    "/:id", // req.params.id
    deleteOneTeacher
)

module.exports = router

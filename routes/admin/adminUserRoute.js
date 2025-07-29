const express = require("express")
const router = express.Router()
const upload=require("../../middlewares/fileUpload")
const { getUsers, 
    getOneUser, updateOneUser,
    deleteOneUser} = require("../../controllers/admin/userManagement")
const { authenticateUser, isAdmin } = require("../../middlewares/authorizedUser")



router.get(
    "/",
    authenticateUser,
    isAdmin,
    getUsers
)


router.get(
    "/:id", // req.params.id
    getOneUser
)

router.put(
    "/:id", // req.params.id
    
    upload.single("profileImage"),
    updateOneUser,
)

router.delete(
    "/:id", // req.params.id
    deleteOneUser
)

module.exports = router

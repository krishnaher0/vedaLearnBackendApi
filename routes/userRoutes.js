const express = require("express");
const { registerUser,loginUser ,sendResetLink,resetPassword} = require("../controllers/userController");

const router = express.Router();

router.post("/register",registerUser)//navigate to the register api
router.post("/login",loginUser) //navigate to login 
router.post("/request-reset", sendResetLink);
router.post("/reset-password/:token", resetPassword);

module.exports = router;

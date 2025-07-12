const express = require("express");
const { registerUser,loginUser } = require("../controllers/userController");
const router = express.Router();

 
 
router.post("/register",registerUser)//navigate to the register api
router.post("/login",loginUser) //navigate to login 


 
module.exports = router;

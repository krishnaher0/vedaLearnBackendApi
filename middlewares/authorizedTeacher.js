const jwt = require("jsonwebtoken")
const Teacher = require("../models/teacherModel")

exports.authenticateTeacher = async (req, res, next) => {
    try{
        // Get token from header
        const authHeader = req.headers.authorization
        if(!authHeader || !authHeader.startsWith("Bearer")){
            return res.status(401).json(
                {"success": false, "message": "Authentication required"}
            )
        }
        const token = authHeader.split(" ")[1] // get token after Bearar prefix
        const decoded = jwt.verify(token, process.env.JWT_SECRET) 
        const teacher = await Teacher.findOne({"_id": decoded._id})
        if(!teacher){
            return res.status(401).json(
                {"success": false, "message": "Token mismatch"}
            )
        }
        // attact user to request for further use
        req.teacher = teacher
        next() // continue to next function
    }catch(err){
        return res.status(500).json(
            {"success": false, "message": "Authentication failed"}
        )
    }
}


exports.isTeacher = async (req, res, next) => {
    if(req.user && req.user.role === 'Teacher'){
        next()
    }else{
        return res.status(403).json(
            {"success": false, "message": "Teacher privilage required"}
        )
    }
}
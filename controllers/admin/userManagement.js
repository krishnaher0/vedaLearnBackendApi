// CRUD
const User = require("../../models/User")
const bcrypt = require("bcrypt")

// Read All
exports.getUsers = async (req, res) => {
    try{
        console.log(req.user)
        const users = await User.find();
        return res.status(200).json(
            {
                "success": true,
                "message": "Data fetched",
                "data": users
            }
        )
    }catch(err){
        return res.status(500).json(
            {"success": false, "message": "Server error"}
        )
    }
}
// Read one
exports.getOneUser = async (req, res) => {
    try{    
        const _id = req.params.id // use mongo id
        const user = await User.findById(_id)
        return res.status(200).json(
            {
                "success": true,
                "message": "One user fetched",
                "data": user
            }
        )
    }catch(err){
        return res.status(500).json(
            {"success": false, "message": "Server Error"}
        )
    }
}
// update
exports.updateOneUser = async (req, res) => {
    const {name,age } = req.body
    const _id = req.params.id
    try{
        const user = await User.updateOne(
            {
                "_id": _id
            },
            {
                $set: {
                    "name": name,
                    
                    "age":age
                }
            },
        )
        return res.status(200).json(
            {"success": true, "message": "User data udpated"}
        )
    }catch(err){
        return res.status(500).json(
            {"success": false, "message": "Server Error"}
        )
    }
}

// Delete
exports.deleteOneUser = async (req, res) => {
    try{
        const _id = req.params.id
        const user = await User.deleteOne(
            {
                "_id": _id
            }
        )
        return res.status(200).json(
            {"success": true, "message": "User deleted"}
        )
    }catch(err){
        return res.status(500).json(
            {"succss": false, "message": "Server Error"}
        )
    }
}
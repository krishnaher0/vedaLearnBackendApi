const Teacher = require("../models/teacherModel")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerTeacher = async (req, res) => {
  try {
    // Destructure values from req.body
    const { name, email, password, age ,role} = req.body;

    // Get uploaded file info
    const cvImagePath = req.file ? req.file.path : null;

    console.log("Form Data:", req.body);
    console.log("Uploaded File:", req.file);

    // Validation
    if (!name || !email || !password || !age) {
      return res.status(400).json({
        success: false,
        msg: "Please enter all the required fields",
      });
    }

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(409).json({
        success: false,
        msg: "Teacher already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new teacher
    const newTeacher = new Teacher({
      name,
      email,
      password: hashedPassword,
      age,
      role,
      cvImage: cvImagePath,
    });

    await newTeacher.save();

    return res.status(201).json({
      success: true,
      msg: "User registered successfully",
    });

  } catch (e) {
    console.error("Registration Error:", e);
    return res.status(500).json({
      success: false,
      msg: "Internal Server Error",
    });
  }
};

 
exports.loginTeacher = async (req, res) => {
  const { email, password } = req.body;
 
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Enter all the fields",
      });
    }
 
    const teacher = await Teacher.findOne({ email: email });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        msg: "Teacher not found",
      });
    }
 
    const validTeacher = await bcrypt.compare(password, teacher.password);
    if (!validTeacher) {
      return res.status(401).json({
        success: false,
        msg: "Invalid credentials",
      });
    }
 
    const payload = {
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      age:teacher.age,
      role:teacher.role,
    };
 
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
 
    return res.status(200).json({
      success: true,
      msg: "Login successful",
      data: payload,
      token: token,
    });
  } catch (e) {
    console.error("Login Error:", e);
    return res.status(500).json({
      success: false,
      msg: "Internal Server Error",
    });
  }
};
 
// module.exports = { registerTeacher, loginTeacher };
 
 
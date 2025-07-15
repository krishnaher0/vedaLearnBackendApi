const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const getTransporter = () => {
  return nodemailer.createTransport({
    service: "Gmail", // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

 
const registerUser = async (req, res) => {
  const { name, email, password, age } = req.body;
 
  try {
    if (!name || !email || !password || !age) {
      return res
        .status(400)
        .json({ success: false, msg: "Please enter all the fields" });
    }
 
   
 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, msg: "User already exists" });
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
 
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      age,
    });
 
    await newUser.save();
 
    return res
      .status(201)
      .json({ success: true, msg: "User registered successfully" });
  } catch (e) {
    console.error("Registration Error:", e);
    return res.status(500).json({
      success: false,
      msg: "Internal Server Error",
    });
  }
};
 
const loginUser = async (req, res) => {
  const { email, password } = req.body;
 
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Enter all the fields",
      });
    }
 
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }
 
    const validUser = await bcrypt.compare(password, user.password);
    if (!validUser) {
      return res.status(401).json({
        success: false,
        msg: "Invalid credentials",
      });
    }
 
    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      age:user.age,
      role:user.role
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

const sendResetLink = async (req, res) => {
  const { email } = req.body;
 
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
 
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
 
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const transporter = getTransporter(); // ✅ Use dynamic transporter
 
    const mailOptions = {
      from: `"TradeVerse" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <p>You requested a password reset. Click the link below:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>This link will expire in 15 minutes.</p>
      `,
    };
 
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "Reset email sent" });
  } catch (err) {
    console.error("Error in sendResetLink:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
 
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  console.log("hello",req.body);
 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashed = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashed });
 
    return res.status(200).json({ success: true, message: "Password updated" });
  } catch (err) {
    console.error("Reset Error:", err);
    return res.status(400).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
 
module.exports = { registerUser, loginUser,resetPassword,sendResetLink };
 
 
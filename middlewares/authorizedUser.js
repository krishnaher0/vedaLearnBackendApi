const jwt = require("jsonwebtoken")
const User = require("../models/User")

exports.authenticateUser = async (req, res, next) => {
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
        const user = await User.findOne({"_id": decoded._id})
        if(!user){
            return res.status(401).json(
                {"success": false, "message": "Token mismatch"}
            )
        }
        // attact user to request for further use
        req.user = user
        next() // continue to next function
    }catch(err){
        return res.status(500).json(
            {"success": false, "message": "Authentication failed"}
        )
    }
}

exports.isAdmin = async (req, res, next) => {
    if(req.user && req.user.role === 'Admin'){
        next()
    }else{
        return res.status(403).json(
            {"success": false, "message": "Admin privilage required"}
        )
    }
}

exports.isAdminOrTeacher = async (req, res, next) => {
    if(req.user && (req.user.role === 'Admin' || req.user.role === 'Teacher')){
        next()
    }else{
        return res.status(403).json(
            {"success": false, "message": "Admin/Teacher privilage required"}
        )
    }
}

const sendResetLink = async (req, res) => {
  const { email } = req.body;
 
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
 
    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
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
 
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
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

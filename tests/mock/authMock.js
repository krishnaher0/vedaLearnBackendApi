module.exports = {
  authenticateUser: (req, res, next) => {
    req.user = { role: "Admin" }; // or "Teacher"
    next();
  },
  isAdmin: (req, res, next) => {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  },
  isAdminOrTeacher: (req, res, next) => {
    if (["Admin", "Teacher"].includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: "Forbidden" });
  }
};


const mockAuthorizedUser = {
  // This property will store the role to be set on req.user for tests
  currentRole: "Admin", // Default role for tests

  authenticateUser: jest.fn((req, res, next) => {
    // Set req.user based on the currentRole for the test
    req.user = { role: mockAuthorizedUser.currentRole };
    next();
  }),

  isAdmin: jest.fn((req, res, next) => {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  }),

  isAdminOrTeacher: jest.fn((req, res, next) => {
    if (["Admin", "Teacher"].includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: "Forbidden" });
  }),

  // Helper function to set the role for a specific test scenario
  setRole: (role) => {
    mockAuthorizedUser.currentRole = role;
  },
};

module.exports = mockAuthorizedUser;

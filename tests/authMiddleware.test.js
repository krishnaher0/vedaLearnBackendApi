const jwt = require("jsonwebtoken");
const { authenticateUser, isAdmin, isAdminOrTeacher } = require("../middlewares/authorizedUser");
const User = require("../models/User");

// Mock Express req, res, next
const mockRequest = (headers = {}, user = null) => ({
  headers,
  user,
});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

jest.mock("../models/User");
jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authenticateUser", () => {
    it("should return 401 if authorization header missing", async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await authenticateUser(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Authentication required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if token is invalid", async () => {
      const req = mockRequest({ authorization: "Bearer invalidtoken" });
      const res = mockResponse();
      jwt.verify.mockImplementation(() => { throw new Error("Invalid token"); });

      await authenticateUser(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Authentication failed",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if user not found", async () => {
      const req = mockRequest({ authorization: "Bearer validtoken" });
      const res = mockResponse();

      jwt.verify.mockReturnValue({ _id: "123" });
      User.findOne.mockResolvedValue(null);

      await authenticateUser(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Token mismatch",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next and attach user if token and user valid", async () => {
      const req = mockRequest({ authorization: "Bearer validtoken" });
      const res = mockResponse();
      const fakeUser = { _id: "123", role: "User" };

      jwt.verify.mockReturnValue({ _id: "123" });
      User.findOne.mockResolvedValue(fakeUser);

      await authenticateUser(req, res, mockNext);

      expect(req.user).toBe(fakeUser);
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("isAdmin", () => {
    it("should call next if user role is Admin", () => {
      const req = mockRequest({}, { role: "Admin" });
      const res = mockResponse();

      isAdmin(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 403 if user role is not Admin", () => {
      const req = mockRequest({}, { role: "User" });
      const res = mockResponse();

      isAdmin(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Admin privilage required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("isAdminOrTeacher", () => {
    it("should call next if user role is Admin", () => {
      const req = mockRequest({}, { role: "Admin" });
      const res = mockResponse();

      isAdminOrTeacher(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should call next if user role is Teacher", () => {
      const req = mockRequest({}, { role: "Teacher" });
      const res = mockResponse();

      isAdminOrTeacher(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 403 if user role is neither Admin nor Teacher", () => {
      const req = mockRequest({}, { role: "User" });
      const res = mockResponse();

      isAdminOrTeacher(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Admin/Teacher privilage required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

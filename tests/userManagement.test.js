const User = require("../../models/User");
const {
  getUsers,
  getOneUser,
  updateOneUser,
  deleteOneUser,
} = require("../../controllers/admin/userController"); // Adjust if your path is different

jest.mock("../../models/User");

const mockRequest = (body = {}, params = {}, user = {}) => ({
  body,
  params,
  user,
});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("UserController CRUD", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("getUsers", () => {
    it("should return all users", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const fakeUsers = [{ name: "A" }, { name: "B" }];

      User.find.mockResolvedValue(fakeUsers);

      await getUsers(req, res);

      expect(User.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Data fetched",
        data: fakeUsers,
      });
    });

    it("should return 500 on DB error", async () => {
      User.find.mockRejectedValue(new Error("DB Error"));
      const req = mockRequest();
      const res = mockResponse();

      await getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error",
      });
    });
  });

  describe("getOneUser", () => {
    it("should return one user by ID", async () => {
      const req = mockRequest({}, { id: "123" });
      const res = mockResponse();
      const fakeUser = { _id: "123", name: "User A" };

      User.findById.mockResolvedValue(fakeUser);

      await getOneUser(req, res);

      expect(User.findById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "One user fetched",
        data: fakeUser,
      });
    });

    it("should return 500 on DB error", async () => {
      User.findById.mockRejectedValue(new Error("Error"));
      const req = mockRequest({}, { id: "123" });
      const res = mockResponse();

      await getOneUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server Error",
      });
    });
  });

  describe("updateOneUser", () => {
    it("should update a user", async () => {
      const req = mockRequest(
        { name: "Updated", age: 30, profileImage: "img.png" },
        { id: "user1" }
      );
      const res = mockResponse();

      User.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await updateOneUser(req, res);

      expect(User.updateOne).toHaveBeenCalledWith(
        { _id: "user1" },
        {
          $set: {
            name: "Updated",
            age: 30,
            profileImage: "img.png",
          },
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User data udpated",
      });
    });

    it("should return 500 on DB error", async () => {
      User.updateOne.mockRejectedValue(new Error("Error"));
      const req = mockRequest(
        { name: "Updated", age: 30 },
        { id: "user1" }
      );
      const res = mockResponse();

      await updateOneUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server Error",
      });
    });
  });

  describe("deleteOneUser", () => {
    it("should delete a user", async () => {
      const req = mockRequest({}, { id: "user1" });
      const res = mockResponse();

      User.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await deleteOneUser(req, res);

      expect(User.deleteOne).toHaveBeenCalledWith({ _id: "user1" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User deleted",
      });
    });

    it("should return 500 on DB error", async () => {
      User.deleteOne.mockRejectedValue(new Error("Error"));
      const req = mockRequest({}, { id: "user1" });
      const res = mockResponse();

      await deleteOneUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        succss: false,
        message: "Server Error",
      });
    });
  });
});

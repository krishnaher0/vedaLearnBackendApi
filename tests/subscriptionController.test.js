const SubscriptionController = require("../controllers/subscriptionController");
const Subscription = require("../models/subscription");
const Plan = require("../models/Plan");
const User = require("../models/User");
const CryptoJS = require("crypto-js");

// Mock Express req, res, next
const mockRequest = (params = {}, user = {}, query = {}) => ({
  params,
  user,
  query,
});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

jest.mock("../models/subscription");
jest.mock("../models/Plan");
jest.mock("../models/User");
jest.mock("crypto-js");

describe("SubscriptionController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ESEWA_SECRET_KEY = "testsecret";
    process.env.ESEWA_SUCCESS_URL = "http://localhost:5173/payment-success";
    process.env.ESEWA_FAILURE_URL = "http://localhost:5173/payment-failure";
  });

  describe("buy", () => {
    it("should respond with purchase details if plan is valid", async () => {
      const planId = "plan123";
      const fakePlan = { _id: planId, price: 100, name: "Test Plan" };
      Plan.findById.mockResolvedValue(fakePlan);

      Subscription.create.mockResolvedValue({}); // mock subscription creation

      // Mock generateEsewaSignature return value
      CryptoJS.HmacSHA256.mockReturnValue({
        toString: () => "hmacsignature",
      });
      CryptoJS.enc = {
        Base64: {
          stringify: jest.fn(() => "signaturebase64"),
        },
      };

      const req = mockRequest({ plan: planId }, { _id: "user1" });
      const res = mockResponse();

      await SubscriptionController.buy(req, res);

      expect(Plan.findById).toHaveBeenCalledWith(planId);
      expect(Subscription.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: "user1",
        plan: planId,
        amount: fakePlan.price,
        status: "PENDING",
      }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        price: fakePlan.price,
        plan: planId,
        planName: fakePlan.name,
        signature: expect.any(String),
        success_url: expect.any(String),
        failure_url: expect.any(String),
      }));
    });

    it("should return 400 if plan not found", async () => {
      Plan.findById.mockResolvedValue(null);
      const req = mockRequest({ plan: "invalid" }, { _id: "user1" });
      const res = mockResponse();

      await SubscriptionController.buy(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Invalid plan");
    });

    it("should return 500 on server error", async () => {
      Plan.findById.mockRejectedValue(new Error("DB error"));
      const req = mockRequest({ plan: "plan1" }, { _id: "user1" });
      const res = mockResponse();

      await SubscriptionController.buy(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server error");
    });
  });

  describe("verify", () => {
    it("should complete subscription and redirect to success if valid", async () => {
      // Setup valid decoded data
      const decoded = {
        status: "COMPLETE",
        transaction_code: "tx123",
        total_amount: 100,
        transaction_uuid: "uuid123",
        product_code: "EPAYTEST",
        signed_field_names: "fieldnames",
        signature: "validsignature",
      };
      // Encode decoded object as base64 JSON string for data param
      const base64Data = Buffer.from(JSON.stringify(decoded)).toString("base64");

      const req = mockRequest({}, {}, { data: base64Data });
      const res = mockResponse();

      // Mock CryptoJS to return matching signature
      CryptoJS.HmacSHA256.mockReturnValue({
        toString: () => "validsignature",
      });
      CryptoJS.enc = {
        Base64: {
          stringify: jest.fn(() => "validsignature"),
        },
      };

      const fakeSubscription = {
        transactionId: "uuid123",
        status: "PENDING",
        save: jest.fn().mockResolvedValue(true),
        userId: "user1",
      };
      Subscription.findOne.mockResolvedValue(fakeSubscription);

      const fakeUser = { subscribed: false, save: jest.fn().mockResolvedValue(true) };
      User.findById.mockResolvedValue(fakeUser);

      await SubscriptionController.verify(req, res);

      expect(Subscription.findOne).toHaveBeenCalledWith({ transactionId: "uuid123" });
      expect(fakeSubscription.status).toBe("COMPLETE");
      expect(fakeSubscription.save).toHaveBeenCalled();
      expect(fakeUser.subscribed).toBe(true);
      expect(fakeUser.save).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(process.env.ESEWA_SUCCESS_URL);
    });


    it("should redirect to failure if status not COMPLETE", async () => {
      const decoded = { status: "FAILED" };
      const base64Data = Buffer.from(JSON.stringify(decoded)).toString("base64");
      const req = mockRequest({}, {}, { data: base64Data });
      const res = mockResponse();

      await SubscriptionController.verify(req, res);

      expect(res.redirect).toHaveBeenCalledWith(process.env.ESEWA_FAILURE_URL);
    });

    it("should redirect to failure on JSON parse or other errors", async () => {
      const req = mockRequest({}, {}, { data: "invalidbase64" });
      const res = mockResponse();

      await SubscriptionController.verify(req, res);

      expect(res.redirect).toHaveBeenCalledWith(process.env.ESEWA_FAILURE_URL);
    });
  });

  describe("getUserSubscriptions", () => {
    it("should return subscriptions on success", async () => {
      const fakeSubs = [{ plan: { name: "Plan A", price: 10 }, userId: { name: "User A" } }];
      Subscription.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
      });
      Subscription.find().populate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeSubs),
      });

      const req = mockRequest();
      const res = mockResponse();

      await SubscriptionController.getUserSubscriptions(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeSubs });
    });

    it("should return 500 on error", async () => {
      Subscription.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
      });
      Subscription.find().populate.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      const req = mockRequest();
      const res = mockResponse();

      await SubscriptionController.getUserSubscriptions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});


const User=require("../models/User.js")
const dotenv = require("dotenv");
const CryptoJS = require("crypto-js");
const { v4: uuidv4 } = require("uuid");
const Subscription = require("../models/subscription.js");
const Plan = require("../models/Plan.js");
require('dotenv').config(); // at the top of your file (only once in your app)
const success = process.env.ESEWA_SUCCESS_URL;
const failure = process.env.ESEWA_FAILURE_URL;

dotenv.config();

const generateEsewaSignature = (total_amount, transaction_uuid, product_code, secret_key) => {
  const signedFields = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  const hash = CryptoJS.HmacSHA256(signedFields, secret_key);
  return CryptoJS.enc.Base64.stringify(hash);
};

class SubscriptionController {
  // User initiates purchase - must be authenticated
  static buy = async (req, res) => {
    try {
      const planId = req.params.plan;
      const plan = await Plan.findById(planId);
      if (!plan) return res.status(400).send("Invalid plan");

      const uid = uuidv4();
      const price = plan.price;
      const productCode = "EPAYTEST";
      const signature = generateEsewaSignature(price, uid, productCode, process.env.ESEWA_SECRET_KEY);

      // Save subscription as pending
      await Subscription.create({
        userId: req.user._id,
        plan: plan._id,
        transactionId: uid,
        amount: price,
        status: "PENDING",
      });

      res.json({
        uid,
        price,
        plan: plan._id,
        planName: plan.name,
        productCode,
        signature,
        success_url: `http://localhost:3001/api/subscription/verify`,  // no planId param here
        failure_url: `http://localhost:3001/subscription/fail`,
      });
    } catch (error) {
      console.error("Error fetching plan:", error);
      res.status(500).send("Server error");
    }
  };

  // eSewa calls this URL after payment (no auth)
  static verify = async (req, res) => {
    const data = req.query.data;

    try {
      const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));

      if (decoded.status === "COMPLETE") {
        const message = `transaction_code=${decoded.transaction_code},status=${decoded.status},total_amount=${decoded.total_amount},transaction_uuid=${decoded.transaction_uuid},product_code=${decoded.product_code},signed_field_names=${decoded.signed_field_names}`;
        const expectedSignature = CryptoJS.HmacSHA256(message, process.env.ESEWA_SECRET_KEY);
        const expectedSignatureBase64 = CryptoJS.enc.Base64.stringify(expectedSignature);

        if (expectedSignatureBase64 !== decoded.signature) {
          return res.status(400).send("Invalid signature");
        }

        // Find existing subscription by transactionId
        const subscription = await Subscription.findOne({ transactionId: decoded.transaction_uuid });
        if (!subscription) return res.status(400).send("Subscription not found");

        subscription.status = "COMPLETE";
        await subscription.save();
        const user = await User.findById(subscription.userId);
if (user) {
  user.subscribed = true;
  await user.save();
}

        return res.redirect(success);
      }

      res.redirect(failure);
    } catch (error) {
      console.error("Verification error:", error);
      res.redirect(failure);
    }
  };

   static getUserSubscriptions = async (req, res) => {
    try {
      const subs = await Subscription.find().populate("plan", "name price").populate("userId", "name");;
      res.json({ success: true, data: subs });
    } catch (err) {
      console.error("Error getting subscriptions:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
}


module.exports = SubscriptionController;

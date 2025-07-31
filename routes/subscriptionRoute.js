const express=require("express")
const SubscriptionController=require("../controllers/subscriptionController.js");
const { authenticateUser } = require("../middlewares/authorizedUser.js")

const router = express.Router();

router.get("/buy/:plan", authenticateUser, SubscriptionController.buy);
router.get("/verify", SubscriptionController.verify);
router.get("/subscribed-users", SubscriptionController.getUserSubscriptions);

module.exports=router;

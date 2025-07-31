const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");
const { authenticateUser } = require("../middlewares/authorizedUser");


router.post("/", planController.createPlan);
router.get("/", authenticateUser,planController.getAllPlans);
router.get("/:id", planController.getPlanById);
router.put("/:id", planController.updatePlan);
router.delete("/:id", planController.deletePlan);

module.exports = router;

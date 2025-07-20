const express = require("express");
const PlanController = require("../controllers/planController");

const router = express.Router();

// Public routes
router.get("/", PlanController.getAll);
router.get("/:id", PlanController.getOne);

// Admin-only routes (protect with middleware if needed)
router.post("/", PlanController.create);
router.put("/:id", PlanController.update);
router.delete("/:id", PlanController.delete);

module.exports = router;

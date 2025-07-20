const Plan = require("../models/Plan");

// Plan Controller
class PlanController {
  // Create a new plan
  static create = async (req, res) => {
    try {
      const { name, price, description } = req.body;
      const existing = await Plan.findOne({ name });
      if (existing) return res.status(400).json({ message: "Plan already exists" });

      const plan = await Plan.create({ name, price, description });
      res.status(201).json(plan);
    } catch (err) {
      console.error("Error creating plan:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Get all plans
  static getAll = async (req, res) => {
    try {
      const plans = await Plan.find();
      res.json(plans);
    } catch (err) {
      console.error("Error fetching plans:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Get one plan by ID or name
  static getOne = async (req, res) => {
    try {
      const { id } = req.params;
      const plan = await Plan.findById(id);
      if (!plan) return res.status(404).json({ message: "Plan not found" });
      res.json(plan);
    } catch (err) {
      console.error("Error fetching plan:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Optional: update a plan
  static update = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, description } = req.body;
      const plan = await Plan.findByIdAndUpdate(
  id, // pass id directly here
  { name, price, description },
  { new: true }
);

      if (!plan) return res.status(404).json({ message: "Plan not found" });
      res.json(plan);
    } catch (err) {
      console.error("Error updating plan:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Optional: delete a plan
  static delete = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Plan.findOneAndDelete(id);
      if (!result) return res.status(404).json({ message: "Plan not found" });
      res.json({ message: "Plan deleted" });
    } catch (err) {
      console.error("Error deleting plan:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = PlanController;

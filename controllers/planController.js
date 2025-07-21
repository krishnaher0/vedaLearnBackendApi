const Plan = require("../models/Plan");

// Create a new plan
exports.createPlan = async (req, res) => {
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
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json({
      success: true,
      message: "Plans fetched successfully",
      data: plans
    });
  } catch (err) {
    console.error("Error fetching plans:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get one plan by ID
exports.getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.status(200).json({
      success: true,
      message: "Plan fetched successfully",
      data: plan
    });
  } catch (err) {
    console.error("Error fetching plan:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a plan
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;
    const plan = await Plan.findByIdAndUpdate(
      id,
      { name, price, description },
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: plan
    });
  } catch (err) {
    console.error("Error updating plan:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a plan
exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Plan.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: "Plan not found" });
    res.status(200).json({ success: true, message: "Plan deleted" });
  } catch (err) {
    console.error("Error deleting plan:", err);
    res.status(500).json({ message: "Server error" });
  }
};

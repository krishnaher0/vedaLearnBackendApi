const Learning = require("../../models/learningModel");

exports.uploadLearningWithFile = async (req, res) => {
  const { course, title, type, textContent } = req.body;

  if (!course || !title) {
    return res.status(400).json({ success: false, message: "Course and title are required" });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No media file uploaded" });
  }

  const normalizedType = type?.toLowerCase();
  if (!['audio', 'video'].includes(normalizedType)) {
    return res.status(400).json({ success: false, message: "Invalid type" });
  }

  const mediaUrl = `/uploads/${req.file.filename}`;

  try {
    const learning = await Learning.create({
      course,
      title,
      type: normalizedType,
      mediaUrl,
      textContent,
    });

    res.status(201).json({ success: true, message: "Learning uploaded", data: learning });
  } catch (err) {
    console.error("Error uploading learning:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

exports.getAllLearnings = async (req, res) => {
  try {
    
    const learnings = await Learning.find().sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: learnings });
  } catch (err) {
    console.error("Error fetching learnings:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


exports.getLearningsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    const learnings = await Learning.find({ course: courseId })
      // .populate("course") // optional, only if you want course details
      .sort({ createdAt: -1 })
      .lean();

      

    res.status(200).json({
      success: true,
      message: "Learnings fetched for course",
      data: learnings,
    });
  } catch (err) {
    console.error("Error fetching learnings by course:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


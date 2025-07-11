const Course = require("../../models/courseModel");

exports.createCourse = async (req, res) => {
  try {
   

    const { language, description } = req.body;

    const flagPath = req.file ? req.file.path : null;
    console.log("Uploaded File (req.file):", req.file);

    // --- STEP 3: BASIC VALIDATION (Similar to registerTeacher) ---
    if (!language || !description) {
      // You can add more specific validation logic here if needed (e.g., min length, type checks)
      return res.status(400).json({
        success: false,
        message: "Please enter all the required fields: language and description.",
      });
    }
    const existingCourse = await Course.findOne({ language: language });
    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: "A course for this language already exists.",
      });
    }
    // End of optional check

    // --- STEP 5: CREATE AND SAVE COURSE ---
    const newCourse = new Course({
      language: language,
      description: description,
      flagPath: flagPath // Use the path from req.file
    });

    await newCourse.save();

    // --- STEP 6: SUCCESS RESPONSE ---
    return res.status(201).json({
      success: true,
      message: "Course created successfully!", // More descriptive message
      data: newCourse
    });

  } catch (err) {
    // --- STEP 7: ERROR HANDLING ---
    console.error("Error creating course (Caught in controller):", err);
    return res.status(500).json({
      success: false,
      message: "Server Error during course creation.",
      error: err.message // Provide the error message for better debugging on frontend
    });
  }
};

exports.getAllCourses=async(req,res)=>{
    try{
        const courses=await Course.find();
        return res.status(200).json({ success:true,message:"All course fetched","data":courses})
    }
    catch(err){
        return res.status(500).json({
            "success":false,
            "message":"Internal server error",
            
        })

    }


}

exports.getCourseById=async (req,res)=>{
    try{
      const flagPath = req.file ? req.file.path : null;
        const course=await Course.findById(req.params.id);
        if(!course) return res.status(400).json({
            success:false,
            message:"course not found"
        })
        return res.status(200).json({
            success:true,
            message:"One course fetched",
            data:course
        })
    }catch(err){
        res.status(500).json({
            success:false,
            message:"Internal server error"
           
        })

    }
}

exports.updateCourse = async (req, res) => {
  try {
    const {language, description } = req.body;
    // Build update object dynamically
    const updateData = {
      language,
      description
    };

    if (req.file) {
      updateData.flagPath =  req.file ? req.file.path : null; // add file if uploaded
    }

    const course = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (err) {
    console.error("Error updating course:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.deleteCourse=async(req,res)=>{
    try {
        const result = await Course.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: 'Course not found' });
        return res.json({ success: true, message: 'Course deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}




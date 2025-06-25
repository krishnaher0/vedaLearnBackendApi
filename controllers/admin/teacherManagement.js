// CRUD
const Teacher = require("../../models/teacherModel")
const bcrypt = require("bcrypt")

// Read All
exports.getTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 30, search = "" } = req.query;

    // Create a case-insensitive regex for search on name or email
    const searchQuery = {
      $or: [
        { teacherName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    };

    const teachers = await Teacher.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Teacher.countDocuments(searchQuery);

    return res.status(200).json({
      success: true,
      message: "Data fetched",
      data: teachers,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    console.error("Error fetching teachers:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Read one
exports.getOneTeacher = async (req, res) => {
    try{    
        const _id = req.params.id // use mongo id
        const teacher = await Teacher.findById(_id)
        
        return res.status(200).json(
            {
                "success": true,
                "message": "One Teacher fetched",
                "data": teacher
            }
        )
    }catch(err){
        return res.status(500).json(
            {"success": false, "message": "Server Error"}
        )
    }
}
// update
exports.updateOneTeacher = async (req, res) => {
         console.log(req.body)
  const _id = req.params.id;
  const { name, email, age,role } = req.body;
  const cvImage = req.file ? req.file.path : null;

  try {
    
    // Build update object dynamically
    const updateFields = {
      ...(name && { name }),
      ...(email && { email }),
      ...(age && { age }),
      ...(role && { role }),

   
    };

    if (cvImage) {
      updateFields.cvImage = cvImage;
    }

    const result = await Teacher.updateOne(
      { _id },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
        console.log(req.body)
      return res.status(404).json({ success: false, message: "Teacher not found or no changes" });
    }

    return res.status(200).json({ success: true, message: "Teacher updated successfully" });
  } catch (err) {
    console.error("Update Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};



// Delete teacher
exports.deleteOneTeacher = async (req, res) => {
    try{
        const _id = req.params.id
        const teacher = await Teacher.deleteOne(
            {
                "_id": _id
            }
        )
        return res.status(200).json(
            {"success": true, "message": "Teacher deleted"}
        )
    }catch(err){
        return res.status(500).json(
            {"succss": false, "message": "Server Error"}
        )
    }
}
const Course = require("../../models/courseModel");

exports.createCourse = async (req, res) => {
    try {
        const flagPath = req.file ? req.file.path : null;

        const course = new Course({
            language: req.body.language,
            description: req.body.description,
            flagPath: flagPath
        });

        await course.save();

        return res.status(201).json({
            success: true,
            message: "Created",
            data: course
        });

    } catch (err) {
        console.error("Error creating course:", err);
        return res.status(500).json({ 
            success: false, 
            message: "Server Error" 
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
            message:"Internal server error",
            data:course
        })

    }
}

exports.updateCourse=async(req,res)=>{
    try{
        const course=await Course.findByIdAndUpdate(
            req.params.id,
            {language:req.body.language,
            description:req.body.description
            },
            {new:true}
        );
        if(!course) return res.status(400).json({
            success:false,
            message:"Cpurse not found"
        });
        return res.status(200).json({
            success:true,
            message:"Course updated successfully"
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Server error"
        })

    }
}

exports.deleteCourse=async(req,res)=>{
    try {
        const result = await Course.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: 'Course not found' });
        return res.json({ success: true, message: 'Course deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}




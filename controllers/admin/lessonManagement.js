const Lesson=require("../../models/lessonModel")
const Course=require("../../models/courseModel")
exports.addLesson=async(req,res)=>{
    try{

  
    const {level,lessonNo,title,courseId}=req.body
    
       
  const lesson = new Lesson({
    level,
    lessonNo,
    title,
    course: courseId  //  IMPORTANT: matches schema's `course` field
});
    await lesson.save()
    return res.status(200).json({
        success:true,
        message:"lesson added",
        data:lesson
    })

}catch(err){
    return res.status(500).json(
        {
            success:false,
            message:"server error"
        }
    )

}
  }

 

exports.getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().populate('course').lean(); // ✅ Use lean() to convert to plain JS objects

    res.status(200).json({
      success: true,
      message: "Lessons fetched successfully",
      data: lessons
    });

  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

  exports.getLessonById=async (req,res)=>{
      try{
          const lesson=await lesson.findById(req.params.id);
          if(!lesson) return res.status(400).json({
              success:false,
              message:"lesson not found"
          })
          return res.status(200).json({
              success:true,
              message:"One lesson fetched",
              data:lesson
          })
      }catch(err){
          res.status(500).json({
              success:false,
              message:"Internal server error",
              data:lesson
          })
  
      }
  }

  exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

const lessons = await Lesson.find({ course: courseId }).populate("course").lean();

    console.log(lessons);

    res.status(200).json({
      success: true,
      message: "Lessons fetched for course",
      data: lessons,
    });
  } catch (err) {
    console.error("Error fetching lessons by course:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

  
  exports.updateLesson=async(req,res)=>{
      try{
          const lesson=await Lesson.findByIdAndUpdate(
              req.params.id,
              {level:req.body.level,
              lessonNo:req.body.lessonNo,
              title:req.body.title,
              courseId:req.body.courseId
              },
              {new:true}
          );
          if(!lesson) return res.status(400).json({
              success:false,
              message:"Course not found"
          });
          if(!lesson) return res.status(400).json({
              success:false,
              message:"lesson not found"
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
  
  exports.deleteLesson=async(req,res)=>{
      try {
          const result = await Lesson.findByIdAndDelete(req.params.id);
          if (!result) return res.status(404).json({ success: false, message: 'Lesson not found' });
          return res.json({ success: true, message: 'Lesson deleted' });
      } catch (err) {
          return res.status(500).json({ success: false, message: "Server Error" });
      }
  }
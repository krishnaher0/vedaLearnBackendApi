require('dotenv').config();
const path=require("path")
const userRoutes=require('./routes/userRoutes')
const teacherRoutes=require('./routes/teacherRoutes')
const adminUserRoutes=require('./routes/admin/adminUserRoute')
const adminTeacherRoutes=require('./routes/admin/adminTeacherRoute')
const adminCourseRoutes=require('./routes/admin/adminCourseRoute')
const adminLessonRoutes=require('./routes/admin/adminLessonRoutes')
const adminQuestionRoutes=require('./routes/admin/adminQuestionRoutes')
const express = require('express');
const { connectDB } = require('./config/db');
//set cors for fixing cors error
const cors=require('cors')
const corsOrigin={
    origin:'*'
}
const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(cors(corsOrigin))
app.use(express.urlencoded({extended:true}))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

connectDB();
app.use("/api/auth",userRoutes)
app.use("/api/auth",teacherRoutes)
app.use("/api/admin/user", adminUserRoutes)
app.use("/api/admin/teacher", adminTeacherRoutes)
app.use("/api/admin/course",adminCourseRoutes)
app.use("/api/admin/lesson",adminLessonRoutes)
app.use("/api/admin/question",adminQuestionRoutes)

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
}
);

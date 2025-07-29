require('dotenv').config();
const express = require('express');
const path=require("path")
const userRoutes=require('./routes/userRoutes')
const teacherRoutes=require('./routes/teacherRoutes')
const adminUserRoutes=require('./routes/admin/adminUserRoute')
const adminTeacherRoutes=require('./routes/admin/adminTeacherRoute')
const adminCourseRoutes=require('./routes/admin/adminCourseRoute')
const adminLessonRoutes=require('./routes/admin/adminLessonRoutes')
const adminQuestionRoutes=require('./routes/admin/adminQuestionRoutes')
const userProgressRoutes=require("./routes/userprogressRoutes")
const learningRoutes=require("./routes/admin/learningRoute")

const subscriptionRoutes=require("./routes/subscriptionRoute")
const planRoutes=require("./routes/planRoutes")

const { connectDB } = require('./config/db');
//set cors for fixing cors error
const cors=require('cors')
const corsOrigin={
    origin:'*'
}
const app = express();


// app.use(cors(corsOrigin))
app.use(cors({
  origin: "http://localhost:5173", // Your frontend origin
  credentials: true,              // Allow cookies/sessions
}));
// app.use(cors({
//   origin: 'http://localhost:5173',  // explicitly allow your frontend origin
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // allowed methods
//   credentials: true,  // if you use cookies or authorization headers
// }));
const PORT = process.env.PORT;


app.use("/uploads", express.static(path.join(__dirname, "uploads")))


connectDB();
app.use(express.json());


app.use(express.urlencoded({extended:true}))
app.use("/api/subscription", subscriptionRoutes);

app.use("/api/auth",userRoutes)
app.use("/api/auths",teacherRoutes)
app.use("/api/admin/user", adminUserRoutes)
app.use("/api/user/progress", userProgressRoutes)
app.use("/api/admin/teacher", adminTeacherRoutes)
app.use("/api/admin/courses",adminCourseRoutes)
app.use("/api/admin/lessons",adminLessonRoutes)
app.use("/api/admin/learnings",learningRoutes)
app.use("/api/admin/questions",adminQuestionRoutes)
app.use("/api/plan",planRoutes)
app.use("/api/subscription",subscriptionRoutes)



app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
}
);

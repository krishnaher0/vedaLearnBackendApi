require('dotenv').config();
const userRoutes=require('./routes/userRoutes')
const express = require('express');
const { connectDB } = require('./config/db');
const app = express();
const PORT = process.env.PORT;
app.use(express.json());
connectDB();
app.use("/api/auth",userRoutes)

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
}
);

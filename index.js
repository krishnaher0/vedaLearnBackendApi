require('dotenv').config();
const userRoutes=require('./routes/userRoutes')
const express = require('express');
const { connectDB } = require('./config/db');
const cors=require('cors')
const corsOrigin={
    origin:'*'
}
const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(cors(corsOrigin))

connectDB();
app.use("/api/auth",userRoutes)

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
}
);

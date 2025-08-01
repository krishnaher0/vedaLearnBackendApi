// server.js
const dotenv = require('dotenv');
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("❌ Failed to connect to DB:", err);
});


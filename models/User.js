const mongoose = require("mongoose");
 
const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    role:{
      type:String,
      enum:["Learner","Admin","Teacher"],
      default:"Learner"
    }
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("User", UserSchema);
 
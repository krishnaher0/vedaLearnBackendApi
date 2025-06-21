const mongoose = require("mongoose");
 
const TeacherSchema = mongoose.Schema(
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
      type: String,
      required: true,
    },
    cvImage:{
        type:String,
        
    },
    role:{
      type:String,
      enum:["Learner","Admin","Teacher"],
      default:"Teacher"
    }
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("Teacher", TeacherSchema);
 
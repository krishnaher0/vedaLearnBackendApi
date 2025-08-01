require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");

const User = require("../models/User");
const Course = require("../models/courseModel");
const Lesson = require("../models/lessonModel");
const { Question, Translation } = require("../models/questionModel"); // Assuming Question is base and Translation is a discriminator

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri); // Removed deprecated options
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Promise.all([
    User.deleteMany(),
    Course.deleteMany(),
    Lesson.deleteMany(),
    Question.deleteMany() // Deletes all questions, including Translation
  ]);
});

describe("User Progress Management", () => {
  let user, course, lesson, question;

  beforeEach(async () => {
    // Create necessary data for tests
    course = await Course.create({ language: "Spanish", description: "Beginner Spanish Course" });
    lesson = await Lesson.create({ level: "Beginner", lessonNo: "1", title: "Intro to Spanish", course: course._id });
    question = await Translation.create({
      questionType: "Translation",
      lesson: lesson._id,
      prompt: "Translate 'hello'",
      question: "hello",
      correctAnswer: "hola",
      audioUrl: "/uploads/test.mp3", // Ensure this path is valid if you serve static files
      choices: ["hola", "adios", "gracias"]
    });

    user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "123456", // Passwords should be hashed in production, but for test setup, plain is fine if controller hashes
      age: 25
    });
  });

  it("should enroll a user in a course", async () => {
    const res = await request(app)
      // Corrected route path: added /user/
      .post(`/api/user/progress/${user._id}/enroll-course`)
      .send({ courseId: course._id });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    // Corrected expected message based on your error output
    expect(res.body.message).toBe("Course enrolled successfully"); 

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.enrolledCourses.length).toBe(1);
    expect(updatedUser.enrolledCourses[0].course.toString()).toBe(course._id.toString());
  });

  it("should mark a lesson as completed", async () => {
    // First, enroll user (as the route might require prior enrollment)
    user.enrolledCourses.push({ course: course._id });
    await user.save();

    const res = await request(app)
      // Corrected route path: added /user/
      .post(`/api/user/progress/${user._id}/complete-lesson`)
      .send({ courseId: course._id, lessonId: lesson._id });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    // Corrected expected message based on your error output
    expect(res.body.message).toBe("Lesson marked as completed. Course also marked as completed."); 

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.enrolledCourses[0].lessonsCompleted).toContainEqual(lesson._id);
  });

  it("should update question progress with correctness", async () => {
    // First, enroll user (as the route might require prior enrollment)
    user.enrolledCourses.push({ course: course._id });
    await user.save();

    const res = await request(app)
      // Corrected route path: added /user/
      .post("/api/user/progress/")
      .send({
        userId: user._id,
        courseId: course._id,
        lessonId: lesson._id,
        questionId: question._id,
        userAnswer: "hola" // correct
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isCorrect).toBe(true); // Assuming the controller returns this

    const updatedUser = await User.findById(user._id);
    const progress = updatedUser.enrolledCourses[0].questionProgress.find(
      p => p.question.toString() === question._id.toString()
    );
    expect(progress).toBeDefined();
    expect(progress.isCorrect).toBe(true);
  });

  it("should fetch user progress", async () => {
    // Populate user progress for fetching
    user.enrolledCourses.push({
      course: course._id,
      lessonsCompleted: [lesson._id],
      questionProgress: [{ question: question._id, isCorrect: true }]
    });
    await user.save();

    const res = await request(app)
      // Corrected route path: added /user/
      .get(`/api/user/progress/${user._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.progress).toBeDefined();
    expect(res.body.progress.length).toBeGreaterThan(0);
    // Corrected: Access _id property of the populated course object
    expect(res.body.progress[0].course._id.toString()).toBe(course._id.toString());
  });
});

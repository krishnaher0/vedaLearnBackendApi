require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const path = require("path");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock("../middlewares/authorizedUser", () => require("./mock/authMock"));

const app = require("../app");
const Lesson = require("../models/lessonModel");
const Course = require("../models/courseModel");
const { Question } = require("../models/questionModel");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  await Question.deleteMany();
  await Lesson.deleteMany();
  await Course.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Polymorphic Question Management", () => {
  let lessonId;

  const sampleCourse = {
    language: "Korean",
    description: "Korean for beginners",
  };

  const sampleLesson = {
    level: "Beginner",
    lessonNo: "1",
    title: "Lesson 1",
  };

  beforeEach(async () => {
    const course = await Course.create(sampleCourse);
    const lesson = await Lesson.create({ ...sampleLesson, course: course._id });
    lessonId = lesson._id;
  });

 

  it("should fetch all questions", async () => {
    await Question.create({
      lesson: lessonId,
      questionType: "TrueFalse",
      question: "Is Korean an East Asian language?",
      correctAnswer: true,
      audioUrl: "/uploads/sample.mp3",
    });

    const res = await request(app).get("/api/admin/questions");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should fetch question by ID", async () => {
    const q = await Question.create({
      lesson: lessonId,
      questionType: "Translation",
      question: "Translate '안녕하세요'",
      correctAnswer: "Hello",
      choices: ["Hi", "Hello", "Goodbye"],
      audioUrl: "/uploads/sample.mp3",
    });

    const res = await request(app).get(`/api/admin/questions/${q._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(q._id.toString());
  });

  it("should update a FillInTheBlank question", async () => {
    const q = await Question.create({
      lesson: lessonId,
      questionType: "FillInTheBlank",
      sentenceWithBlank: "I ___ Korean.",
      correctAnswer: "study",
      choices: ["learn", "study", "write"],
    });

    const res = await request(app)
      .put(`/api/admin/questions/${q._id}`)
      .field("questionType", "FillInTheBlank")
      .field("sentenceWithBlank", "You ___ Korean.")
      .field("correctAnswer", "learn")
      .field("choices", JSON.stringify(["learn", "read", "eat"]));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.correctAnswer).toBe("learn");
  });

  it("should delete a question", async () => {
    const q = await Question.create({
      lesson: lessonId,
      questionType: "Ordering",
      items: ["eat", "I", "rice"],
      correctOrder: ["I", "eat", "rice"],
    });

    const res = await request(app).delete(`/api/admin/questions/${q._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Question deleted");

    const exists = await Question.findById(q._id);
    expect(exists).toBeNull();
  });

  it("should fetch question by lesson and index", async () => {
    await Question.create([
      {
        lesson: lessonId,
        questionType: "Listening",
        audioUrl: "/uploads/audio1.mp3",
        correctAnswer: "Hello",
        choices: ["Hi", "Hello", "Bye"],
      },
      {
        lesson: lessonId,
        questionType: "Listening",
        audioUrl: "/uploads/audio2.mp3",
        correctAnswer: "Thanks",
        choices: ["Please", "Thanks", "Welcome"],
      },
    ]);

    const res = await request(app).get(`/api/admin/questions/lesson/${lessonId}/index/2`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.questionIndex).toBe(2);
    expect(res.body.question).toBeDefined();
  });

  it("should delete all questions", async () => {
    await Question.create({
      lesson: lessonId,
      questionType: "TrueFalse",
      question: "Is this test working?",
      correctAnswer: true,
      audioUrl: "/uploads/sample.mp3",
    });

    const res = await request(app).delete("/api/admin/questions/many");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const count = await Question.countDocuments();
    expect(count).toBe(0);
  });
});

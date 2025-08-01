require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock("../middlewares/authorizedUser", () => require("./mock/authMock"));

const app = require("../app");
const Lesson = require("../models/lessonModel");
const Course = require("../models/courseModel");

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
  await Lesson.deleteMany();
  await Course.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Lesson Management", () => {
  let courseId;

  const sampleCourse = {
    language: "French",
    description: "Intro to French"
  };

  const sampleLesson = {
    level: "Beginner",
    lessonNo: "1",
    title: "French Greetings"
  };

  beforeEach(async () => {
    const course = await Course.create(sampleCourse);
    courseId = course._id;
  });

  it("should create a new lesson", async () => {
    const res = await request(app)
      .post("/api/admin/lessons")
      .send({ ...sampleLesson, courseId });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(sampleLesson.title);
  });

  it("should fetch all lessons", async () => {
    await Lesson.create({ ...sampleLesson, course: courseId });

    const res = await request(app).get("/api/admin/lessons");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should fetch a lesson by ID", async () => {
    const lesson = await Lesson.create({ ...sampleLesson, course: courseId });

    const res = await request(app).get(`/api/admin/lessons/${lesson._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(lesson._id.toString());
  });

  it("should fetch lessons by course", async () => {
    await Lesson.create({ ...sampleLesson, course: courseId });

    const res = await request(app).get(`/api/admin/lessons/course/${courseId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should update a lesson", async () => {
    const lesson = await Lesson.create({ ...sampleLesson, course: courseId });

    const updatedData = {
      level: "Intermediate",
      lessonNo: "2",
      title: "Updated Lesson",
      courseId: courseId.toString()
    };

    const res = await request(app)
      .put(`/api/admin/lessons/${lesson._id}`)
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedLesson = await Lesson.findById(lesson._id);
    expect(updatedLesson.title).toBe("Updated Lesson");
    expect(updatedLesson.level).toBe("Intermediate");
  });

  it("should delete a lesson", async () => {
    const lesson = await Lesson.create({ ...sampleLesson, course: courseId });

    const res = await request(app).delete(`/api/admin/lessons/${lesson._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Lesson deleted");

    const check = await Lesson.findById(lesson._id);
    expect(check).toBeNull();
  });
});

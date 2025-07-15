require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const path = require("path");
const fs = require('fs'); // Node.js file system module

// Mock auth middlewares (assuming your mock/authMock.js is correctly set up)
jest.mock("../middlewares/authorizedUser", () => require("./mock/authMock"));

const app = require("../app");
const Course = require("../models/courseModel"); // Ensure this path is correct

let mongoServer;
const UPLOADS_DIR = path.join(__dirname, '../uploads'); // Path to your main uploads directory
const FIXTURES_DIR = path.join(__dirname, 'fixtures'); // Path to your test fixtures directory
const SAMPLE_FLAG_PATH = path.join(FIXTURES_DIR, 'sample-flag.png');

beforeAll(async () => {
  // 1. Create uploads directory for multer
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // 2. Create fixtures directory and a dummy file for tests
  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }
  // Create a dummy image file if it doesn't exist
  if (!fs.existsSync(SAMPLE_FLAG_PATH)) {
    // This creates a minimal valid PNG header, enough for multer to recognize it as an image
    fs.writeFileSync(SAMPLE_FLAG_PATH, Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]));
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri); // Removed deprecated options
});

afterEach(async () => {
  await Course.deleteMany({});
  // Clean up uploaded files after each test
  const files = fs.readdirSync(UPLOADS_DIR);
  for (const file of files) {
    // Ensure we only delete files created by tests to avoid deleting critical app files
    // Adjust prefix if your multer generates different filenames (e.g., based on fieldname)
    if (file.startsWith('flagPath-') || file.startsWith('cvImage-')) { // Add other prefixes if needed
      fs.unlinkSync(path.join(UPLOADS_DIR, file));
    }
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
  // Remove the uploads directory after all tests are done
  if (fs.existsSync(UPLOADS_DIR)) {
    fs.rmSync(UPLOADS_DIR, { recursive: true, force: true });
  }
  // Remove the fixtures directory after all tests are done
  if (fs.existsSync(FIXTURES_DIR)) {
    fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
  }
});

describe("Course Management", () => {
  const sampleCourse = {
    language: "Japanese",
    description: "Basic course for Japanese",
  };

  let createdId;

  // Ensure your POST route for creating a course also uses upload.single('flagPath')
  // Example: router.post("/", authenticateUser, isAdmin, upload.single("flagPath"), createCourse);
  it("should create a new course with flag image", async () => {
    const res = await request(app)
      .post("/api/admin/courses")
      .field("language", sampleCourse.language)
      .field("description", sampleCourse.description)
      .attach("flagPath", SAMPLE_FLAG_PATH); // Use the guaranteed path

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.language).toBe(sampleCourse.language);
    expect(res.body.data.flagPath).toBeDefined(); // Expect flagPath to be set
    expect(res.body.data.flagPath).toMatch(/uploads\/flagPath-/); // Corrected path pattern
    createdId = res.body.data._id;
  });

  it("should fetch all courses", async () => {
    await Course.create({ ...sampleCourse });

    const res = await request(app).get("/api/admin/courses");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should fetch a course by ID", async () => {
    const course = await Course.create({ ...sampleCourse });

    const res = await request(app).get(`/api/admin/courses/${course._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(course._id.toString());
  });

  // Ensure your PUT route for updating a course also uses upload.single('flagPath')
  // Example: router.put("/:id", authenticateUser, isAdmin, upload.single("flagPath"), updateCourse);
  it("should update a course", async () => {
    const course = await Course.create({ ...sampleCourse });

    const res = await request(app)
      .put(`/api/admin/courses/${course._id}`)
      .field("language", "Korean")
      .field("description", "Updated course")
      .attach("flagPath", SAMPLE_FLAG_PATH); // Use the guaranteed path

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.course.language).toBe("Korean");
    expect(res.body.course.flagPath).toBeDefined(); // Expect flagPath to be updated
    expect(res.body.course.flagPath).toMatch(/uploads\/flagPath-/); // Corrected path pattern
  });

  it("should delete a course", async () => {
    const course = await Course.create({ ...sampleCourse });

    const res = await request(app).delete(`/api/admin/courses/${course._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Course deleted");

    const check = await Course.findById(course._id);
    expect(check).toBeNull();
  });
});
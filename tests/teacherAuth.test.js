const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app"); // Adjust path to your main Express app file
const Teacher = require("../models/teacherModel"); // Adjust path to your Teacher model
const bcrypt = require("bcrypt"); // For hashing passwords in setup
const jwt = require("jsonwebtoken"); // For mocking JWT secret
const fs = require('fs'); // Node.js file system module
const path = require('path'); // Node.js path module

let mongoServer;
const UPLOADS_DIR = path.join(__dirname, '../uploads'); // Path to the uploads directory
const TEST_FILES_DIR = path.join(__dirname, 'test-files'); // Path to your test-files directory
const TEST_CV_PATH = path.join(TEST_FILES_DIR, 'test-cv.pdf');
const INVALID_FILE_PATH = path.join(TEST_FILES_DIR, 'invalid-file.txt');


// Set a mock JWT_SECRET for testing
process.env.JWT_SECRET = "test_jwt_secret";

beforeAll(async () => {
  // Create the uploads directory if it doesn't exist
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Create test-files directory and dummy files
  if (!fs.existsSync(TEST_FILES_DIR)) {
    fs.mkdirSync(TEST_FILES_DIR, { recursive: true });
  }
  // Create a dummy PDF file (with some content to be more realistic)
  if (!fs.existsSync(TEST_CV_PATH)) {
    const dummyPdfContent = Buffer.from(Array(1024).fill('a').join('') + '%PDF-1.4\n%âãÏÓ\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<<>>>>endobj 4 0 obj<</Length 11>>stream\nBT /F1 12 Tf 0 0 Td (Hello) Tj ET\nendstream\nendobj xref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000074 00000 n\n0000000155 00000 n\n0000000213 00000 n\ntrailer<</Size 5/Root 1 0 R>>startxref\n293\n%%EOF');
    fs.writeFileSync(TEST_CV_PATH, dummyPdfContent);
  }
  // Create a dummy invalid file type (with content)
  if (!fs.existsSync(INVALID_FILE_PATH)) {
    fs.writeFileSync(INVALID_FILE_PATH, "This is a dummy text file with some content for testing file type validation.");
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri); // Removed deprecated options
});

afterEach(async () => {
  // Clean up the Teacher collection after each test
  await Teacher.deleteMany({});
  // Clean up uploaded files after each test
  const files = fs.readdirSync(UPLOADS_DIR);
  for (const file of files) {
    // Ensure we only delete files created by tests to avoid deleting critical app files
    if (file.startsWith('cvImage-')) { // Adjust prefix if your multer generates different filenames
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
  // Remove the test-files directory after all tests are done
  if (fs.existsSync(TEST_FILES_DIR)) {
    fs.rmSync(TEST_FILES_DIR, { recursive: true, force: true });
  }
});

describe("Teacher Authentication API", () => {
  const testTeacher = {
    name: "Test Teacher",
    email: "teacher@example.com",
    password: "securepassword123",
    age: "30", // Age is a string in your schema
    role: "Teacher",
  };



  // Test case for teacher registration without a CV image (optional field)
  it("should register a new teacher without a CV image", async () => {
    const { cvImage, ...teacherWithoutCv } = testTeacher; // Remove cvImage
    const res = await request(app)
      .post("/api/auths/register/teacher") // Corrected route path
      .send(teacherWithoutCv); // Use .send() for non-multipart/form-data

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("User registered successfully");
    expect(res.body.teacher).toBeDefined();
    expect(res.body.teacher.email).toBe(testTeacher.email);
    expect(res.body.teacher.cvImage).toBeNull(); // Corrected: Expecting null
    
    const teacherInDb = await Teacher.findOne({ email: testTeacher.email });
    expect(teacherInDb).not.toBeNull();
    expect(teacherInDb.cvImage).toBeNull(); // Verify it's null in DB
  });

  // Test case for teacher registration with missing required fields
  it("should not register a teacher with missing required fields", async () => {
    const incompleteTeacher = {
      name: "Incomplete Teacher",
      email: "incomplete@example.com",
      // password and age are missing
    };

    const res = await request(app)
      .post("/api/auths/register/teacher") // Corrected route path
      .send(incompleteTeacher);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.msg).toBe("Please enter all the required fields");
  });

  // Test case for registering an existing teacher
  it("should not register an existing teacher", async () => {
    const hashedPassword = await bcrypt.hash(testTeacher.password, 10);
    await new Teacher({ ...testTeacher, password: hashedPassword }).save(); // Pre-save an existing teacher

    const res = await request(app)
      .post("/api/auths/register/teacher") // Corrected route path
      .field("name", testTeacher.name)
      .field("email", testTeacher.email)
      .field("password", testTeacher.password)
      .field("age", testTeacher.age);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.msg).toBe("Teacher already exists");
  });

  // Test case for successful teacher login
  it("should login a teacher with correct credentials", async () => {
    const hashedPassword = await bcrypt.hash(testTeacher.password, 10);
    await new Teacher({ ...testTeacher, password: hashedPassword }).save(); // Register the teacher first

    const res = await request(app)
      .post("/api/auths/login/teacher") // Corrected route path
      .send({
        email: testTeacher.email,
        password: testTeacher.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("Login successful");
    expect(res.body.data).toBeDefined();
    expect(res.body.data.email).toBe(testTeacher.email);
    expect(res.body.token).toBeDefined(); // Check if a token is returned
  });

  // Test case for login with invalid password
  it("should not login with invalid password", async () => {
    const hashedPassword = await bcrypt.hash(testTeacher.password, 10);
    await new Teacher({ ...testTeacher, password: hashedPassword }).save(); // Register the teacher first

    const res = await request(app)
      .post("/api/auths/login/teacher") // Corrected route path
      .send({
        email: testTeacher.email,
        password: "wrongpassword", // Incorrect password
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.msg).toBe("Invalid credentials");
  });

  // Test case for login with non-existent email
  it("should not login if teacher not found", async () => {
    const res = await request(app)
      .post("/api/auths/login/teacher") // Corrected route path
      .send({
        email: "nonexistent@example.com", // Email not in DB
        password: testTeacher.password,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.msg).toBe("Teacher not found");
  });

  // Test case for login with missing fields
  it("should not login with missing email or password", async () => {
    // Missing email
    let res = await request(app)
      .post("/api/auths/login/teacher") // Corrected route path
      .send({ password: testTeacher.password });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.msg).toBe("Enter all the fields");

    // Missing password
    res = await request(app)
      .post("/api/auths/login/teacher") // Corrected route path
      .send({ email: testTeacher.email });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.msg).toBe("Enter all the fields");
  });

  
});

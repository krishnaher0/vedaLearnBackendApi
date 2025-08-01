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

// Set a mock JWT_SECRET for testing
process.env.JWT_SECRET = "test_jwt_secret";

// beforeAll(async () => {
//   // Create the uploads directory if it doesn't exist
//   if (!fs.existsSync(UPLOADS_DIR)) {
//     fs.mkdirSync(UPLOADS_DIR, { recursive: true });
//   }

//   mongoServer = await MongoMemoryServer.create();
//   const uri = mongoServer.getUri();

//   await mongoose.connect(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
// });

// afterEach(async () => {
//   // Clean up the Teacher collection after each test
//   await Teacher.deleteMany({});
//   // Clean up uploaded files after each test
//   const files = fs.readdirSync(UPLOADS_DIR);
//   for (const file of files) {
//     fs.unlinkSync(path.join(UPLOADS_DIR, file));
//   }
// });

// afterAll(async () => {
//   await mongoose.connection.close();
//   await mongoServer.stop();
//   // Remove the uploads directory after all tests are done
//   if (fs.existsSync(UPLOADS_DIR)) {
//     fs.rmSync(UPLOADS_DIR, { recursive: true, force: true });
//   }
// });

// describe("Teacher Authentication API", () => {
//   const testTeacher = {
//     name: "Test Teacher",
//     email: "teacher@example.com",
//     password: "securepassword123",
//     age: "30", // Age is a string in your schema
//     role: "Teacher",
//   };

//   // Test case for successful teacher registration with a CV image
//   it("should register a new teacher with a CV image", async () => {
//     const res = await request(app)
//       .post("/api/auths/register/teacher") // Updated route
//       .field("name", testTeacher.name)
//       .field("email", testTeacher.email)
//       .field("password", testTeacher.password)
//       .field("age", testTeacher.age)
//       .field("role", testTeacher.role)
//       .attach("cvImage", path.join(__dirname, 'test-files', 'test-cv.pdf')); // Attach a real or mock PDF file

//     expect(res.statusCode).toBe(201);
//     expect(res.body.success).toBe(true);
//     expect(res.body.msg).toBe("User registered successfully");
//     expect(res.body.teacher).toBeDefined();
//     expect(res.body.teacher.email).toBe(testTeacher.email);
//     expect(res.body.teacher.cvImage).toBeDefined(); // Check if cvImage path is set

//     const teacherInDb = await Teacher.findOne({ email: testTeacher.email });
//     expect(teacherInDb).not.toBeNull();
//     expect(teacherInDb.name).toBe(testTeacher.name);
//     // Verify password is hashed (not the plain text password)
//     expect(await bcrypt.compare(testTeacher.password, teacherInDb.password)).toBe(true);
//     expect(teacherInDb.cvImage).toMatch(/\/uploads\/cvImage-/); // Check the path pattern generated by multer
//   });

//   // Test case for teacher registration without a CV image (optional field)
//   it("should register a new teacher without a CV image", async () => {
//     const { cvImage, ...teacherWithoutCv } = testTeacher; // Remove cvImage
//     const res = await request(app)
//       .post("/api/auths/register/teacher") // Updated route
//       .send(teacherWithoutCv); // Use .send() for non-multipart/form-data

//     expect(res.statusCode).toBe(201);
//     expect(res.body.success).toBe(true);
//     expect(res.body.msg).toBe("User registered successfully");
//     expect(res.body.teacher).toBeDefined();
//     expect(res.body.teacher.email).toBe(testTeacher.email);
//     expect(res.body.teacher.cvImage).toBeUndefined(); // cvImage should not be set

//     const teacherInDb = await Teacher.findOne({ email: testTeacher.email });
//     expect(teacherInDb).not.toBeNull();
//     expect(teacherInDb.cvImage).toBeUndefined();
//   });

//   // Test case for teacher registration with missing required fields
//   it("should not register a teacher with missing required fields", async () => {
//     const incompleteTeacher = {
//       name: "Incomplete Teacher",
//       email: "incomplete@example.com",
//       // password and age are missing
//     };

//     const res = await request(app)
//       .post("/api/auths/register/teacher") // Updated route
//       .send(incompleteTeacher);

//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//     expect(res.body.msg).toBe("Please enter all the required fields");
//   });

//   // Test case for registering an existing teacher
//   it("should not register an existing teacher", async () => {
//     const hashedPassword = await bcrypt.hash(testTeacher.password, 10);
//     await new Teacher({ ...testTeacher, password: hashedPassword }).save(); // Pre-save an existing teacher

//     const res = await request(app)
//       .post("/api/auths/register/teacher") // Updated route
//       .field("name", testTeacher.name)
//       .field("email", testTeacher.email)
//       .field("password", testTeacher.password)
//       .field("age", testTeacher.age);

//     expect(res.statusCode).toBe(409);
//     expect(res.body.success).toBe(false);
//     expect(res.body.msg).toBe("Teacher already exists");
//   });

//   // Test case for successful teacher login
//   it("should login a teacher with correct credentials", async () => {
//     const hashedPassword = await bcrypt.hash(testTeacher.password, 10);
//     await new Teacher({ ...testTeacher, password: hashedPassword }).save(); // Register the teacher first

//     const res = await request(app)
//       .post("/api/auths/login/teacher") // Updated route
//       .send({
//         email: testTeacher.email,
//         password: testTeacher.password,
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.msg).toBe("Login successful");
//     expect(res.body.data).toBeDefined();
//     expect(res.body.data.email).toBe(testTeacher.email);
//     expect(res.body.token).toBeDefined(); // Check if a token is returned
//   });

//   // Test case for login with invalid password
//   it("should not login with invalid password", async () => {
//     const hashedPassword = await bcrypt.hash(testTeacher.password, 10);
//     await new Teacher({ ...testTeacher, password: hashedPassword }).save(); // Register the teacher first

//     const res = await request(app)
//       .post("/api/auths/login/teacher") // Updated route
//       .send({
//         email: testTeacher.email,
//         password: "wrongpassword", // Incorrect password
//       });

//     expect(res.statusCode).toBe(401);
//     expect(res.body.success).toBe(false);
//     expect(res.body.msg).toBe("Invalid credentials");
//   });

//   // Test case for login with non-existent email
//   it("should not login if teacher not found", async () => {
//     const res = await request(app)
//       .post("/api/auths/login/teacher") // Updated route
//       .send({
//         email: "nonexistent@example.com", // Email not in DB
//         password: testTeacher.password,
//       });

//     expect(res.statusCode).toBe(404);
//     expect(res.body.success).toBe(false);
//     expect(res.body.msg).toBe("Teacher not found");
//   });

//   // Test case for login with missing fields
//   it("should not login with missing email or password", async () => {
//     // Missing email
//     let res = await request(app)
//       .post("/api/auths/login/teacher") // Updated route
//       .send({ password: testTeacher.password });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//     expect(res.body.msg).toBe("Enter all the fields");

//     // Missing password
//     res = await request(app)
//       .post("/api/auths/login/teacher") // Updated route
//       .send({ email: testTeacher.email });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//     expect(res.body.msg).toBe("Enter all the fields");
//   });

//   // Test case for file type validation (e.g., uploading a non-image/audio file)
//   it("should not register a teacher with an invalid file type", async () => {
//     const res = await request(app)
//       .post("/api/auths/register/teacher") // Updated route
//       .field("name", testTeacher.name)
//       .field("email", "invalidfile@example.com")
//       .field("password", testTeacher.password)
//       .field("age", testTeacher.age)
//       .field("role", testTeacher.role)
//       .attach("cvImage", path.join(__dirname, 'test-files', 'invalid-file.txt')); // Attach a text file

//     expect(res.statusCode).toBe(500); // Multer errors are often caught by generic error handlers
//     expect(res.text).toContain("Something broke!"); // Check for generic error message from app.js
   
//   });
// });
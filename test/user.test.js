const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const User = require("../models/User");

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
  await User.deleteMany(); // Clean up after each test
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});


describe("User Authentication API", () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    age: 25
  };

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("User registered successfully");

    const user = await User.findOne({ email: testUser.email });
    expect(user).not.toBeNull();
    expect(user.name).toBe(testUser.name);
  });

  it("should not register an existing user", async () => {
    await new User({ ...testUser, password: "hashed" }).save();

    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.msg).toBe("User already exists");
  });

  it("should login a user with correct credentials", async () => {
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await new User({ ...testUser, password: hashedPassword }).save();

    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it("should not login with invalid password", async () => {
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await new User({ ...testUser, password: hashedPassword }).save();

    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword"
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.msg).toBe("Invalid credentials");
  });
});

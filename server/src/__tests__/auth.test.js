import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";

describe("POST /api/v1/auth/register", () => {
  it("registers a new user with a valid, real-looking email and strong password", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email: "testuser@gmail.com",
      password: "Zx9#mK2vQ!",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("testuser@gmail.com");

    // Confirm the user actually exists in the database and isn't
    // yet verified (since email verification is required — Step 29)
    const savedUser = await User.findOne({ email: "testuser@gmail.com" });
    expect(savedUser).not.toBeNull();
    expect(savedUser.isEmailVerified).toBe(false);
  });

  it("rejects a weak password", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email: "weakpass@gmail.com",
      password: "weak",
    });

    expect(res.status).toBe(400);
  });

  it("rejects a disposable email domain", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email: "test@10minutemail.com",
      password: "Zx9#mK2vQ!",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/disposable/i);
  });

  it("rejects a duplicate email", async () => {
    await request(app).post("/api/v1/auth/register").send({
      name: "First User",
      email: "duplicate@gmail.com",
      password: "Zx9#mK2vQ!",
    });

    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Second User",
      email: "duplicate@gmail.com",
      password: "Zx9#mK2vQ!",
    });

    expect(res.status).toBe(409);
  });
});

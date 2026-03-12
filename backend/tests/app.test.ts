jest.mock("../src/services/authService", () => ({
  login: jest.fn()
}));

jest.mock("../src/services/adminService", () => ({
  listStudents: jest.fn(),
  createStudent: jest.fn(),
  updateStudent: jest.fn(),
  listSubjects: jest.fn(),
  createSubject: jest.fn(),
  upsertGrade: jest.fn()
}));

jest.mock("../src/services/studentService", () => ({
  getStudentGrades: jest.fn()
}));

import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app";
import * as authService from "../src/services/authService";
import * as adminService from "../src/services/adminService";
import * as studentService from "../src/services/studentService";
import { jwtSecret } from "../src/config";

function createToken(payload: object) {
  return jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
}

describe("Grade management API", () => {
  test("POST /auth/login returns a token for valid credentials", async () => {
    jest.spyOn(authService, "login").mockResolvedValue({
      token: "token-123",
      user: { id: 1, email: "admin@example.com", role: "ADMIN", studentId: null }
    });

    const response = await request(app).post("/auth/login").send({
      email: "admin@example.com",
      password: "secret123"
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBe("token-123");
  });

  test("GET /admin/students blocks unauthenticated users", async () => {
    const response = await request(app).get("/admin/students");

    expect(response.statusCode).toBe(401);
  });

  test("GET /admin/students blocks students from admin routes", async () => {
    const token = createToken({ id: 2, role: "STUDENT", studentId: 9 });

    const response = await request(app)
      .get("/admin/students")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
  });

  test("POST /admin/grades accepts a valid admin request", async () => {
    const token = createToken({ id: 1, role: "ADMIN" });

    jest.spyOn(adminService, "upsertGrade").mockResolvedValue({
      status: 200,
      body: { id: 1, value: "A" }
    });

    const response = await request(app)
      .post("/admin/grades")
      .set("Authorization", `Bearer ${token}`)
      .send({
        studentId: 1,
        subjectId: 2,
        value: "A"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.value).toBe("A");
  });

  test("GET /student/me/grades only returns the logged-in student's data", async () => {
    const token = createToken({ id: 3, role: "STUDENT", studentId: 7 });

    jest.spyOn(studentService, "getStudentGrades").mockResolvedValue({
      id: 7,
      fullName: "Anna Bergstrom",
      grades: [{ id: 1, value: "B", subjectId: 1, subjectName: "English 5", year: 1 }]
    });

    const response = await request(app)
      .get("/student/me/grades")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(studentService.getStudentGrades).toHaveBeenCalledWith(7);
    expect(response.body.id).toBe(7);
  });

  test("GET /student/me/grades returns 401 for an invalid token", async () => {
    const response = await request(app)
      .get("/student/me/grades")
      .set("Authorization", "Bearer invalid-token");

    expect(response.statusCode).toBe(401);
  });
});

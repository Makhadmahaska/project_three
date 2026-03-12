import request from "supertest"
import app from "../src/app"

describe("API protection", () => {

  test("admin route requires authentication", async () => {

    const res = await request(app).get("/admin/students")

    expect(res.statusCode).toBe(401)
  })

})
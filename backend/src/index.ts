import express from "express"
import { prisma } from "../lib/db"

const app = express()

app.get("/test-db", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1`
    res.json({ db: "connected", result })
  } catch (error) {
    res.status(500).json({ db: "failed", error })
  }
})

// start server only when not testing
if (process.env.NODE_ENV !== "test") {
  app.listen(3000, () => {
    console.log("Server running on port 3000")
  })
}

export default app
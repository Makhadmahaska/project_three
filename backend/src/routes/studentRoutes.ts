import express from "express"
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth"
import { Role } from "../../generated/prisma/client"
import { getStudentGrades } from "../services/studentService"

const router = express.Router()

router.use(requireAuth, requireRole(Role.STUDENT))

router.get("/me/grades", async (req: AuthRequest, res) => {

  const studentId = req.user?.studentId

  if (!studentId) {
    return res.status(404).json({ message: "Student profile missing" })
  }

  const student = await getStudentGrades(studentId)

  res.json(student)
})

export default router
import express from "express"
import { requireAuth, requireRole } from "../middleware/auth"
import { Role } from "../../generated/prisma/client"
import * as service from "../services/adminService"
import {
  createStudentSchema,
  updateStudentSchema,
  createSubjectSchema,
  upsertGradeSchema
} from "../validation/schemas"

const router = express.Router()

router.use(requireAuth, requireRole(Role.ADMIN))

router.get("/students", async (_req, res) => {
  const students = await service.listStudents()
  res.json(students)
})

router.post("/students", async (req, res) => {

  const data = createStudentSchema.parse(req.body)

  const student = await service.createStudent(data)

  res.status(201).json(student)
})

router.put("/students/:id", async (req, res) => {

  const data = updateStudentSchema.parse(req.body)

  const student = await service.updateStudent(
    Number(req.params.id),
    data.fullName
  )

  res.json(student)
})

router.get("/subjects", async (_req, res) => {

  const subjects = await service.listSubjects()

  res.json(subjects)
})

router.post("/subjects", async (req, res) => {

  const data = createSubjectSchema.parse(req.body)

  const subject = await service.createSubject(data.name, data.year)

  res.status(201).json(subject)
})

router.post("/grades", async (req, res) => {

  const data = upsertGradeSchema.parse(req.body)

  const grade = await service.upsertGrade(
    data.studentId,
    data.subjectId,
    data.value
  )

  res.json(grade)
})

export default router
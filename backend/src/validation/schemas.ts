import { z } from "zod"

export const createStudentSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  firebaseUid: z.string()
})

export const updateStudentSchema = z.object({
  fullName: z.string().min(2)
})

export const createSubjectSchema = z.object({
  name: z.string().min(2),
  year: z.number().min(1).max(5)
})

export const upsertGradeSchema = z.object({
  studentId: z.number(),
  subjectId: z.number(),
  value: z.enum(["A","B","C","D","E","F"])
})
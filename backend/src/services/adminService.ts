import { prisma } from "../../lib/db";
import { GradeValue } from "../../generated/prisma/client"

export async function listStudents() {
  return prisma.student.findMany({
    include: {
      user: {
        select: { email: true, role: true }
      }
    },
    orderBy: { fullName: "asc" }
  })
}

export async function createStudent(data: {
  fullName: string
  email: string
  firebaseUid: string
}) {

  return prisma.student.create({
    data: {
      fullName: data.fullName,
      user: {
        create: {
          email: data.email,
          firebaseUid: data.firebaseUid,
          role: "STUDENT"
        }
      }
    }
  })
}

export async function updateStudent(studentId: number, fullName: string) {

  return prisma.student.update({
    where: { id: studentId },
    data: { fullName }
  })
}

export async function listSubjects() {
  return prisma.subject.findMany({
    orderBy: [{ year: "asc" }, { name: "asc" }]
  })
}

export async function createSubject(name: string, year: number) {

  return prisma.subject.create({
    data: { name, year }
  })
}

export async function upsertGrade(
  studentId: number,
  subjectId: number,
  value: GradeValue
) {

  return prisma.grade.upsert({
    where: {
      studentId_subjectId: {
        studentId,
        subjectId
      }
    },
    update: { value },
    create: { studentId, subjectId, value }
  })
}
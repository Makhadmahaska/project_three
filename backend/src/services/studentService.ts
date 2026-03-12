import prisma from "../lib/prisma"

export async function getStudentGrades(studentId: number) {

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      grades: {
        include: { subject: true },
        orderBy: {
          subject: { year: "asc" }
        }
      }
    }
  })

  if (!student) return null

  return {
    id: student.id,
    fullName: student.fullName,
    grades: student.grades.map(g => ({
      id: g.id,
      value: g.value,
      subject: g.subject.name,
      year: g.subject.year
    }))
  }
}
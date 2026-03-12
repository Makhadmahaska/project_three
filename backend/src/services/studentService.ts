import prisma from "../db/prisma";

export async function getStudentGrades(studentId: number) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      grades: {
        include: {
          subject: true
        },
        orderBy: {
          subject: {
            year: "asc"
          }
        }
      }
    }
  });

  if (!student) {
    return null;
  }

  return {
    id: student.id,
    fullName: student.fullName,
    grades: student.grades.map((grade) => ({
      id: grade.id,
      value: grade.value,
      subjectId: grade.subjectId,
      subjectName: grade.subject.name,
      year: grade.subject.year
    }))
  };
}

import bcrypt from "bcryptjs";
import prisma from "../db/prisma";
import { isValidGrade } from "../utils/gradeValidation";

interface ServiceResponse<T> {
  status: number;
  body: T;
}

interface CreateStudentInput {
  fullName?: string;
  email?: string;
  password?: string;
}

interface UpdateStudentInput {
  fullName?: string;
}

interface CreateSubjectInput {
  name?: string;
  year?: number | string;
}

interface UpsertGradeInput {
  studentId?: number | string;
  subjectId?: number | string;
  value?: string;
}

export async function listStudents() {
  return prisma.student.findMany({
    include: {
      user: {
        select: {
          email: true,
          role: true
        }
      }
    },
    orderBy: { fullName: "asc" }
  });
}

export async function createStudent(data: CreateStudentInput): Promise<ServiceResponse<unknown>> {
  const { fullName, email, password } = data;

  if (!fullName || !email || !password) {
    return { status: 400, body: { message: "fullName, email, and password are required." } };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return { status: 409, body: { message: "A user with this email already exists." } };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const student = await prisma.student.create({
    data: {
      fullName,
      user: {
        create: {
          email,
          passwordHash,
          role: "STUDENT"
        }
      }
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true
        }
      }
    }
  });

  return { status: 201, body: student };
}

export async function updateStudent(
  studentId: number,
  data: UpdateStudentInput
): Promise<ServiceResponse<unknown>> {
  const student = await prisma.student.findUnique({ where: { id: studentId } });

  if (!student) {
    return { status: 404, body: { message: "Student not found." } };
  }

  const updatedStudent = await prisma.student.update({
    where: { id: studentId },
    data: {
      fullName: data.fullName || student.fullName
    },
    include: {
      user: {
        select: {
          email: true,
          role: true
        }
      }
    }
  });

  return { status: 200, body: updatedStudent };
}

export async function listSubjects() {
  return prisma.subject.findMany({
    orderBy: [{ year: "asc" }, { name: "asc" }]
  });
}

export async function createSubject(data: CreateSubjectInput): Promise<ServiceResponse<unknown>> {
  const { name, year } = data;

  if (!name || !year) {
    return { status: 400, body: { message: "name and year are required." } };
  }

  const subject = await prisma.subject.create({
    data: {
      name,
      year: Number(year)
    }
  });

  return { status: 201, body: subject };
}

export async function upsertGrade(data: UpsertGradeInput): Promise<ServiceResponse<unknown>> {
  const studentId = Number(data.studentId);
  const subjectId = Number(data.subjectId);
  const value = data.value;

  if (!studentId || !subjectId || !value) {
    return { status: 400, body: { message: "studentId, subjectId, and value are required." } };
  }

  if (!isValidGrade(value)) {
    return { status: 400, body: { message: "Grade must be one of A, B, C, D, E, or F." } };
  }

  const [student, subject] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId } }),
    prisma.subject.findUnique({ where: { id: subjectId } })
  ]);

  if (!student) {
    return { status: 404, body: { message: "Student not found." } };
  }

  if (!subject) {
    return { status: 404, body: { message: "Subject not found." } };
  }

  const grade = await prisma.grade.upsert({
    where: {
      studentId_subjectId: {
        studentId,
        subjectId
      }
    },
    update: {
      value
    },
    create: {
      studentId,
      subjectId,
      value
    },
    include: {
      student: {
        select: {
          id: true,
          fullName: true
        }
      },
      subject: true
    }
  });

  return { status: 200, body: grade };
}

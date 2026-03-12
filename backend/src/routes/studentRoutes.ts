import express, { Response } from "express";
import { AuthRequest, requireAuth, requireRole } from "../middleware/auth";
import { getStudentGrades } from "../services/studentService";

const router = express.Router();

router.use(requireAuth, requireRole("STUDENT"));

router.get("/me/grades", async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId;

    if (!studentId) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    const student = await getStudentGrades(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.status(200).json(student);
  } catch {
    return res.status(500).json({ message: "Could not load grades." });
  }
});

export default router;

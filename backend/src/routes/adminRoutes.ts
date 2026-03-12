import express, { Request, Response } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  createStudent,
  createSubject,
  listStudents,
  listSubjects,
  updateStudent,
  upsertGrade
} from "../services/adminService";

const router = express.Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/students", async (_req: Request, res: Response) => {
  try {
    const students = await listStudents();
    return res.status(200).json(students);
  } catch {
    return res.status(500).json({ message: "Could not load students." });
  }
});

router.post("/students", async (req: Request, res: Response) => {
  try {
    const result = await createStudent(req.body);
    return res.status(result.status).json(result.body);
  } catch {
    return res.status(500).json({ message: "Could not create student." });
  }
});

router.put("/students/:studentId", async (req: Request, res: Response) => {
  try {
    const result = await updateStudent(Number(req.params.studentId), req.body);
    return res.status(result.status).json(result.body);
  } catch {
    return res.status(500).json({ message: "Could not update student." });
  }
});

router.get("/subjects", async (_req: Request, res: Response) => {
  try {
    const subjects = await listSubjects();
    return res.status(200).json(subjects);
  } catch {
    return res.status(500).json({ message: "Could not load subjects." });
  }
});

router.post("/subjects", async (req: Request, res: Response) => {
  try {
    const result = await createSubject(req.body);
    return res.status(result.status).json(result.body);
  } catch {
    return res.status(500).json({ message: "Could not create subject." });
  }
});

router.post("/grades", async (req: Request, res: Response) => {
  try {
    const result = await upsertGrade(req.body);
    return res.status(result.status).json(result.body);
  } catch {
    return res.status(500).json({ message: "Could not save grade." });
  }
});

export default router;

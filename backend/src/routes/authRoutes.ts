import express, { Request, Response } from "express";
import { login } from "../services/authService";

const router = express.Router();

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const result = await login(email, password);

    if (!result) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ message: "Login failed." });
  }
});

export default router;

import { NextFunction, Request, Response } from "express";
import admin from "./firebase";
import { prisma } from "./lib/db";
import { Role } from "../../generated/prisma/enums";

export interface AuthUser {
  uid: string;
  email?: string;
  role: Role;
  studentId?: number | null;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> {

  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { student: true }
    });

    if (!user) {
      return res.status(401).json({ message: "User not registered." });
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: user.role,
      studentId: user.student?.id ?? null
    };

    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
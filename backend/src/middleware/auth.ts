import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { jwtSecret } from "../config";

export interface AuthUser extends JwtPayload {
  id: number;
  email: string;
  role: Role;
  studentId: number | null;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Response | void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const token = header.split(" ")[1];

  try {
    req.user = jwt.verify(token, jwtSecret) as AuthUser;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireRole(role: Role) {
  return function roleMiddleware(req: AuthRequest, res: Response, next: NextFunction): Response | void {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: "You are not allowed to access this route." });
    }

    next();
  };
}

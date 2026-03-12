import { Response, NextFunction } from "express";
import { Role } from "../../generated/prisma/enums";
import { AuthRequest } from "./auth.middleware";

export function requireRole(role: Role) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden." });
    }

    next();
  };
}
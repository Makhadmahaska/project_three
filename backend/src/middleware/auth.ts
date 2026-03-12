import { Request, Response, NextFunction } from "express"
import  admin from "../../firebase";
import { prisma } from "../../lib/db";
import { Role } from "../../generated/prisma/client"

export interface AuthUser {
  uid: string
  email?: string
  role: Role
  studentId?: number | null
}

export interface AuthRequest extends Request {
  user?: AuthUser
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const token = header.split(" ")[1]

  try {
    const decoded = await admin.auth().verifyIdToken(token)

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { student: true }
    })

    if (!user) {
      return res.status(401).json({ message: "User not registered" })
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: user.role,
      studentId: user.student?.id
    }

    next()
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

export function requireRole(role: Role) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden" })
    }

    next()
  }
}
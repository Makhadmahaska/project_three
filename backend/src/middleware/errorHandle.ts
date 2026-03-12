import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {

  console.error(err);

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.errors.map(e => ({
        field: e.path.join("."),
        message: e.message
      }))
    });
  }

  // Generic server error
  return res.status(500).json({
    message: "Internal server error"
  });
}
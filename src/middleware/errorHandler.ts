import { Request, Response, NextFunction } from "express";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: "Route not found" });
}

interface AppError extends Error {
  status?: number;
}

export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong on the server",
  });
}

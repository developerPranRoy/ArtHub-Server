import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "./auth.service.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, confirmPassword, role } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const data = await registerUser({ name, email, password, role });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const data = await loginUser({ email, password });
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

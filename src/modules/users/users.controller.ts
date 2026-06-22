import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types.js";
import * as usersService from "./users.service.js";

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getUserById(req.user!.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, photo } = req.body;
    const user = await usersService.updateProfile(req.user!.id, { name, photo });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function changeMyPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    await usersService.changePassword(req.user!.id, currentPassword, newPassword);
    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const users = await usersService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function changeUserRole(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await usersService.updateUserRole(req.params.id, req.body.role);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function upgradeSubscription(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // NOTE: In production, this runs only after Stripe confirms payment success
    // (e.g. inside a verified webhook handler). Here it's a direct stub.
    const { tier } = req.body;
    const user = await usersService.updateSubscription(req.user!.id, tier);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

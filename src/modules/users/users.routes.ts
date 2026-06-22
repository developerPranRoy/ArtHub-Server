import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as ctrl from "./users.controller.js";

const router = Router();

router.get("/me", requireAuth, ctrl.getMe);
router.patch("/me", requireAuth, ctrl.updateMe);
router.patch("/me/password", requireAuth, ctrl.changeMyPassword);
router.patch("/me/subscription", requireAuth, ctrl.upgradeSubscription);

// Admin only
router.get("/", requireAuth, requireRole("admin"), ctrl.listUsers);
router.patch("/:id/role", requireAuth, requireRole("admin"), ctrl.changeUserRole);

export default router;

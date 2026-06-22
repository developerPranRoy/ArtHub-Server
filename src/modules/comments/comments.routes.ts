import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import * as ctrl from "./comments.controller.js";

// mounted at /api/artworks/:id/comments
const router = Router({ mergeParams: true });

router.get("/", ctrl.list);
router.post("/", requireAuth, ctrl.create);
router.patch("/:commentId", requireAuth, ctrl.update);
router.delete("/:commentId", requireAuth, ctrl.remove);

export default router;

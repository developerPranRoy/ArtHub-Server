import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as ctrl from "./artworks.controller.js";

const router = Router();


router.get("/browse", ctrl.browse);
router.get("/featured", ctrl.featured);
router.get("/top-artists", ctrl.topArtists);
router.get("/:id", ctrl.getOne);


router.post("/", requireAuth, requireRole("artist"), ctrl.create);
router.patch("/:id", requireAuth, requireRole("artist"), ctrl.update);
router.get("/mine/list", requireAuth, requireRole("artist"), ctrl.myArtworks);


router.delete("/:id", requireAuth, requireRole("artist", "admin"), ctrl.remove);


router.get("/admin/all", requireAuth, requireRole("admin"), ctrl.allForAdmin);

export default router;

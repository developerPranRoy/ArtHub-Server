import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as ctrl from "./transactions.controller.js";

const router = Router();

router.post("/purchase", requireAuth, requireRole("user"), ctrl.purchase);
router.post("/subscribe", requireAuth, ctrl.subscribe);
router.get("/mine", requireAuth, requireRole("user"), ctrl.myPurchases);
router.get("/sales", requireAuth, requireRole("artist"), ctrl.mySales);

router.get("/", requireAuth, requireRole("admin"), ctrl.allTransactions);
router.get("/analytics", requireAuth, requireRole("admin"), ctrl.analytics);

export default router;

import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { uploadImage } from "../controllers/uploadController.js";

const router = Router();

router.post(
  "/image",
  requireAuth,
  requireRole(["ADMIN", "EVENT_PLANNER"]),
  uploadImage
);

export default router;

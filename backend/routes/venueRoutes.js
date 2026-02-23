import { Router } from "express";
import { listVenues, createVenue } from "../controllers/venueController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = new Router();

router.get("/", listVenues);

router.post(
  "/",
  requireAuth,
  requireRole(["EVENT_PLANNER", "ADMIN"]),
  createVenue
);

export default router;

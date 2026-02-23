import { Router } from "express";
import {
  listEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventCrontroller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

//GET all public events (strict forst POSTMAN QA testing)
router.get("/", listEvents);

//POST aka create an event(must be authorized as planner or admin)
router.post(
  "/",
  requireAuth,
  requireRole(["EVENT_PLANNER", "ADMIN"]),
  createEvent
);

//GET event by id
router.get("/:id", getEventById);

//PATCH aka update an event
router.patch(
  "/:id",
  requireAuth,
  requireRole(["EVENT_PLANNER", "ADMIN"]),
  updateEvent
);

//DELETE an event
router.delete(
  "/:id",
  requireAuth,
  requireRole(["EVENT_PLANENR", "ADMIN"]),
  deleteEvent
);

export default router;

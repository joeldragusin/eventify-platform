import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  listTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  listAllTickets,
} from "../controllers/ticketController.js";

const router = Router();

//GET all tickets
router.get("/", listTickets);

//POST a icket, only as an admin or event_planner
router.post(
  "/",
  requireAuth,
  requireRole(["EVENT_PLANNER", "ADMIN"]),
  createTicket
);

router.patch(
  "/:id",
  requireAuth,
  requireRole(["EVENT_PLANNER", "ADMIN"]),
  updateTicket
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["EVENT_PLANNER", "ADMIN"]),
  deleteTicket
);

router.get("/all", requireAuth, requireRole(["ADMIN"]), listAllTickets);

export default router;

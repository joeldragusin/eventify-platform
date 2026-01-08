import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  listTestimonials,
  createTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialController.js";

const router = Router();

//GET --> list testimonials present in DB
router.get("/", listTestimonials);

//POST --> create a testimonial also as ADMIN only
router.post("/", requireAuth, requireRole(["ADMIN"]), createTestimonial);

//DELETE --> delete a testimonial as ADMON only
router.delete("/:id", requireAuth, requireRole(["ADMIN"]), deleteTestimonial);

export default router;

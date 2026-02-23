import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createReview,
  listReviewsByEvent,
  deleteReview,
  listAllReviews,
} from "../controllers/reviewController.js";

const router = Router();

//GET --> list reviews for a specific event(based on eventId)
router.get("/", listReviewsByEvent);

//POST ---> create a review for a specific event
router.post("/", requireAuth, createReview);

//DELETE --> delete a review if you are the logged in user or the admin
router.delete("/:id", requireAuth, deleteReview);

//GET ---> list all reviews for DEBUG purposes ONLY, for QA (not to be implemented in frontend)
router.get("/all", requireAuth, requireRole(["ADMIN"]), listAllReviews);

export default router;

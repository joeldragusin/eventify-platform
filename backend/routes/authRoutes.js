import { Router } from "express";
import {
  login,
  register,
  getMe,
  logout,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { authLimiter } from "../middleware/rateLimit.js";

const router = Router();

//POST /api/auth/register
router.post("/register", authLimiter, register);

//POST /api/router/login
router.post("/login", authLimiter, login);

//since it requires auth, this endpoint is protected
router.get("/me", requireAuth, getMe);

//also protected
router.post("/logout", requireAuth, logout);

export default router;

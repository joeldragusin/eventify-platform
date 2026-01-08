import { Router } from "express";
import {
  login,
  register,
  getMe,
  logout,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

//POST /api/auth/register
router.post("/register", register);

//POST /api/router/login
router.post("/login", login);

//since it requires auth, this endpoint is protected
router.get("/me", requireAuth, getMe);

//also protected
router.post("/logout", requireAuth, logout);

export default router;

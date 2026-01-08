import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createOrder,
  listMyOrders,
  getMyOrderById,
  listAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = Router();

//cream o comanda aka un cos de cumparaturi
router.post("/", requireAuth, createOrder);

//userul logat isi vede toate comenzile lui
router.get("/my", requireAuth, listMyOrders);

//userul logat isi vede comenzile dupa :id (URL-ul difera)
router.get("/my/:id", requireAuth, getMyOrderById);

//for DEBUG purposes ONLY ---> acces doar ca ADMIN
router.get("/", requireAuth, requireRole(["ADMIN"]), listAllOrders);

//PATCH --> ADMIN can update the status of an order (DEBUG purposes only)
router.patch(
  "/:id/status",
  requireAuth,
  requireRole(["ADMIN"]),
  updateOrderStatus
);

export default router;

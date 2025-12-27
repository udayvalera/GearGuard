import { Router } from "express";
import { createEquipment, getEquipment, getEquipmentStats, getEquipmentRequests } from "../controllers/equipment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Protected Routes
router.use(authenticate());

// 3.1 Create (Admin/Manager only usually, but allowed for now)
router.post("/", authenticate(['ADMIN', 'MANAGER']), createEquipment);

// 3.2 List (Role-filtered)
router.get("/", getEquipment);

// 3.3 Stats
router.get("/:id/stats", getEquipmentStats);

// 3.4 History
router.get("/:id/requests", getEquipmentRequests);

export default router;
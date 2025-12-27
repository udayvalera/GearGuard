import { Router } from "express";
import { getMaintenanceStages } from "../controllers/stages.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { Role } from "@prisma/client";

const router = Router();

/**
 * GET /api/v1/stages
 * Access: ADMIN, TECHNICIAN
 */
router.get(
  "/",
  requireRole(Role.ADMIN, Role.TECHNICIAN),
  getMaintenanceStages
);

export default router;

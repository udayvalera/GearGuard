import { Router } from "express";
import { getMaintenanceTeams } from "../controllers/teams.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { Role } from "@prisma/client";

const router = Router();

/**
 * GET /api/v1/teams
 * Access: ADMIN, TECHNICIAN, EMPLOYEE
 */
router.get(
  "/",
  requireRole(Role.ADMIN, Role.TECHNICIAN, Role.EMPLOYEE),
  getMaintenanceTeams
);

export default router;

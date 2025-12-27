import { Router } from "express";
import { getMaintenanceTeams } from "../controllers/teams.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { Role } from "@prisma/client";

const router = Router();

/**
 * GET /api/v1/teams
 * Access: ADMIN, TECHNICIAN, EMPLOYEE
 */
/**
 * @swagger
 * /api/v1/teams:
 *   get:
 *     summary: Get all maintenance teams
 *     description: Returns a list of all maintenance teams in the system.
 *     tags:
 *       - Metadata
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of maintenance teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: IT Support
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */

router.get(
  "/",
  requireRole(Role.ADMIN, Role.TECHNICIAN, Role.EMPLOYEE),
  getMaintenanceTeams
);

export default router;

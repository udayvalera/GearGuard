import { Router } from "express";
import { getMaintenanceStages } from "../controllers/stages.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { Role } from "@prisma/client";

const router = Router();

router.use(authenticate());

/**
 * GET /api/v1/stages
 * Access: ADMIN, TECHNICIAN
 */
/**
 * @swagger
 * /api/v1/stages:
 *   get:
 *     summary: Get maintenance stages
 *     description: Returns ordered list of maintenance workflow stages.
 *     tags:
 *       - Metadata
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ordered list of stages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   sequence:
 *                     type: integer
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */

router.get(
  "/",
  requireRole(Role.ADMIN, Role.MANAGER, Role.TECHNICIAN),
  getMaintenanceStages
);

export default router;

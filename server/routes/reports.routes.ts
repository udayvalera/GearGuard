import { Router } from "express";
import { getRequestBreakdown } from '../controllers/reports.controller.js';
import { requireRole } from "../middleware/requireRole.js";
import { Role } from "@prisma/client";

const router = Router();

/**
 * GET /api/v1/reports/breakdown
 * Query: ?group_by=team | category
 * Access: ADMIN
 */

/**
 * @swagger
 * /api/v1/reports/breakdown:
 *   get:
 *     summary: Get maintenance request breakdown report
 *     description: Returns count of maintenance requests grouped by team or equipment category.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: group_by
 *         required: true
 *         schema:
 *           type: string
 *           enum: [team, category]
 *         description: Group results by team or category
 *     responses:
 *       200:
 *         description: Breakdown report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   group:
 *                     type: string
 *                     example: Mechanics
 *                   count:
 *                     type: integer
 *                     example: 12
 *       400:
 *         description: Invalid group_by parameter
 *       403:
 *         description: Access denied (Admin only)
 *       500:
 *         description: Internal server error
 */

router.get("/breakdown", requireRole(Role.ADMIN),getRequestBreakdown);

export default router;

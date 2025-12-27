import { Router } from "express";
import { getMaintenanceTeams, createTeam, updateTeam, deleteTeam } from "../controllers/teams.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { Role } from "@prisma/client";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate());

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

/**
 * @swagger
 * /api/v1/teams:
 *   post:
 *     summary: Create a maintenance team
 *     tags: [Metadata]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team created
 */
router.post(
  "/",
  requireRole(Role.ADMIN),
  createTeam
);

/**
 * @swagger
 * /api/v1/teams/{id}:
 *   put:
 *     summary: Update a maintenance team
 *     tags: [Metadata]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team updated
 */
router.put(
  "/:id",
  requireRole(Role.ADMIN),
  updateTeam
);

/**
 * @swagger
 * /api/v1/teams/{id}:
 *   delete:
 *     summary: Delete a maintenance team
 *     tags: [Metadata]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Team deleted
 */
router.delete(
  "/:id",
  requireRole(Role.ADMIN),
  deleteTeam
);

export default router;

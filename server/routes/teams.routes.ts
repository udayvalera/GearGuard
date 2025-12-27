import { Router } from "express";
import { getMaintenanceTeams, createTeam, updateTeam, deleteTeam, addTechnicianToTeam, removeTechnicianFromTeam, getAvailableTechnicians } from "../controllers/teams.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { Role } from "@prisma/client";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate());

/**
 * GET /api/v1/teams
 * Access: ADMIN, MANAGER, TECHNICIAN, EMPLOYEE
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
  requireRole(Role.ADMIN, Role.MANAGER, Role.TECHNICIAN, Role.EMPLOYEE),
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
 * /api/v1/teams/technicians/available:
 *   get:
 *     summary: Get available technicians not assigned to any team
 *     tags: [Metadata]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of available technicians
 */
router.get(
  "/technicians/available",
  requireRole(Role.ADMIN),
  getAvailableTechnicians
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

/**
 * @swagger
 * /api/v1/teams/{id}/technicians:
 *   post:
 *     summary: Add a technician to a team
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
 *               technician_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Technician added to team
 */
router.post(
  "/:id/technicians",
  requireRole(Role.ADMIN),
  addTechnicianToTeam
);

/**
 * @swagger
 * /api/v1/teams/{id}/technicians/{technicianId}:
 *   delete:
 *     summary: Remove a technician from a team
 *     tags: [Metadata]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: technicianId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Technician removed from team
 */
router.delete(
  "/:id/technicians/:technicianId",
  requireRole(Role.ADMIN),
  removeTechnicianFromTeam
);

export default router;

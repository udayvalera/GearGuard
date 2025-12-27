import { Router } from "express";
import {
  createEquipment,
  getEquipment,
  getEquipmentStats,
  getEquipmentRequests
} from "../controllers/equipment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Equipment
 *   description: Equipment asset management
 */

router.use(authenticate());

/**
 * @swagger
 * /equipment:
 *   post:
 *     summary: Create new equipment (Admin/Manager)
 *     tags: [Equipment]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - serial_number
 *               - category_id
 *               - maintenance_team_id
 *             properties:
 *               name:
 *                 type: string
 *               serial_number:
 *                 type: string
 *               location:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               maintenance_team_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Equipment created
 *       409:
 *         description: Serial number conflict
 */
router.post("/", authenticate(["ADMIN", "MANAGER"]), createEquipment);

/**
 * @swagger
 * /equipment:
 *   get:
 *     summary: List equipment (role-filtered)
 *     tags: [Equipment]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or serial number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of equipment
 */
router.get("/", getEquipment);

/**
 * @swagger
 * /equipment/{id}/stats:
 *   get:
 *     summary: Get maintenance stats for smart badge
 *     tags: [Equipment]
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
 *         description: Equipment maintenance stats
 *       404:
 *         description: Equipment not found
 */
router.get("/:id/stats", getEquipmentStats);

/**
 * @swagger
 * /equipment/{id}/requests:
 *   get:
 *     summary: Get request history for equipment
 *     tags: [Equipment]
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
 *         description: List of maintenance requests
 *       404:
 *         description: Equipment not found
 */
router.get("/:id/requests", getEquipmentRequests);

export default router;
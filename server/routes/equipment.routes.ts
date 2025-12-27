import { validate } from "../middleware/validate.middleware.js";
import { createEquipmentSchema, assignEquipmentSchema } from "../schemas/equipment.schema.js";
import { Router } from "express";
import {
  createEquipment,
  getEquipment,
  getEquipmentStats,
  getEquipmentRequests,
  assignEquipment
} from "../controllers/equipment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Equipment
 *   description: Equipment asset management and visibility
 */

router.use(authenticate());

/**
 * @swagger
 * /equipment:
 *   post:
 *     summary: Create new equipment
 *     description: >
 *       Admins can create equipment for any team.
 *       Managers can ONLY create equipment for their assigned maintenance team.
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
 *               - maintenance_team_id
 *               - category_id
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
 *               default_technician_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Equipment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 serial_number:
 *                   type: string
 *                 is_active:
 *                   type: boolean
 *       403:
 *         description: Manager attempted to create equipment for a different team
 *       409:
 *         description: Serial number conflict
 */
router.post("/", authenticate(["ADMIN", "MANAGER"]), validate(createEquipmentSchema), createEquipment);

/**
 * @swagger
 * /equipment:
 *   get:
 *     summary: List equipment
 *     description: >
 *       - Admins see all equipment.
 *       - Managers and Technicians see only their team's equipment.
 *       - Employees see only equipment assigned to them.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       serial_number:
 *                         type: string
 *                       category:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                       maintenance_team:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get("/", getEquipment);

/**
 * @swagger
 * /equipment/{id}/stats:
 *   get:
 *     summary: Get maintenance stats
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 equipment_id:
 *                   type: integer
 *                 total_requests:
 *                   type: integer
 *                 open_requests:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   example: Maintenance Required
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   subject:
 *                     type: string
 *                   status:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   stage:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *       404:
 *         description: Equipment not found
 */
router.get("/:id/requests", getEquipmentRequests);

/**
 * @swagger
 * /equipment/{id}/assign:
 *   patch:
 *     summary: Assign equipment to an employee
 *     tags: [Equipment]
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
 *               employee_id:
 *                 type: integer
 *                 nullable: true
 *                 description: ID of the employee to assign (or null to unassign)
 *     responses:
 *       200:
 *         description: Equipment assigned successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Equipment not found
 */
router.patch("/:id/assign", authenticate(["ADMIN"]), validate(assignEquipmentSchema), assignEquipment);

export default router;
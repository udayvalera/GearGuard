import { Router } from "express";
import {
  createRequest,
  getRequests,
  assignRequest,
  updateStatus,
  getCalendar,
  getRequestLogs
} from "../controllers/request.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Maintenance request workflow
 */

router.use(authenticate());

/**
 * @swagger
 * /requests/calendar:
 *   get:
 *     summary: Get preventive maintenance calendar
 *     tags: [Requests]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of preventive maintenance events
 */
router.get("/calendar", getCalendar);

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a maintenance request
 *     tags: [Requests]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - request_type
 *               - equipment_id
 *             properties:
 *               subject:
 *                 type: string
 *               request_type:
 *                 type: string
 *                 enum: [CORRECTIVE, PREVENTIVE]
 *               equipment_id:
 *                 type: integer
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Request created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Equipment is scrapped
 */
router.post("/", createRequest);

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: List maintenance requests (Kanban / Calendar)
 *     tags: [Requests]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: view_type
 *         schema:
 *           type: string
 *           enum: [kanban, calendar]
 *       - in: query
 *         name: technician_id
 *         schema:
 *           type: string
 *           description: Use "me" to fetch assigned requests
 *     responses:
 *       200:
 *         description: List of maintenance requests
 */
router.get("/", getRequests);

/**
 * @swagger
 * /requests/{id}/assign:
 *   patch:
 *     summary: Assign a technician to a request
 *     tags: [Requests]
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
 *             required:
 *               - technician_id
 *             properties:
 *               technician_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Technician assigned
 *       403:
 *         description: Cross-team assignment violation
 *       404:
 *         description: Request not found
 */
router.patch("/:id/assign", assignRequest);

/**
 * @swagger
 * /requests/{id}/status:
 *   patch:
 *     summary: Update request status (workflow transition)
 *     tags: [Requests]
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
 *             required:
 *               - stage_id
 *             properties:
 *               stage_id:
 *                 type: integer
 *               duration_hours:
 *                 type: number
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid workflow transition
 *       404:
 *         description: Request not found
 */
router.patch("/:id/status", updateStatus);

/**
 * @swagger
 * /requests/{id}/logs:
 *   get:
 *     summary: Get audit logs for a request
 *     tags: [Requests]
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
 *         description: List of maintenance logs
 *       404:
 *         description: Request not found
 */
router.get("/:id/logs", getRequestLogs);

export default router;
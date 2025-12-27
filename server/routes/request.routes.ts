import { Router } from "express";
import {
  createRequest,
  getRequests,
  assignRequest,
  updateStatus,
  getCalendar,
  getRequestLogs,
  updateRequestDetails
} from "../controllers/request.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Maintenance workflow, planning, and execution
 */

router.use(authenticate());

/**
 * @swagger
 * /requests/calendar:
 *   get:
 *     summary: Get preventive maintenance calendar
 *     description: View schedule for preventive maintenance. Scoped by team for Managers and Technicians.
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
 *     description: >
 *       Creates a new Corrective or Preventive request.
 *       - Corrective: Standard breakdown reporting.
 *       - Preventive: Requires `scheduled_date` in the future.
 *       - Audit: Automatically logs creation in maintenance logs.
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
 *                 description: Required for Preventive. Must be today or in the future.
 *     responses:
 *       201:
 *         description: Request created
 *       400:
 *         description: Validation error (e.g. past date)
 *       409:
 *         description: Equipment is scrapped
 */
router.post("/", createRequest);

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: List maintenance requests
 *     description: >
 *       - Admins: See all requests.
 *       - Managers and Technicians: See only their team's requests.
 *       - Employees: See only requests they created.
 *       - Includes overdue flag for preventive requests.
 *     tags: [Requests]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of maintenance requests
 */
router.get("/", getRequests);

/**
 * @swagger
 * /requests/{id}/assign:
 *   patch:
 *     summary: Assign a technician
 *     description: >
 *       Manager assigns a technician.
 *       Strictly enforces that the technician belongs to the equipment's maintenance team.
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
 *         description: Assigned successfully
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
 *     description: >
 *       Moves request through workflow stages.
 *       - Repaired: Only TECHNICIANS can perform and must provide duration.
 *       - Scrap: Only MANAGERS or ADMINS can perform and deactivates equipment.
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
 *                 description: Required when moving to Repaired.
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid transition or missing duration
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Request not found
 */
router.patch("/:id/status", updateStatus);

/**
 * @swagger
 * /requests/{id}/logs:
 *   get:
 *     summary: Get audit logs
 *     description: Returns history of creation, assignments, status changes, and rescheduling.
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

/**
 * @swagger
 * /requests/{id}:
 *   patch:
 *     summary: Reschedule preventive request
 *     description: >
 *       Allows Managers to reschedule a preventive request.
 *       - Only applicable to Preventive requests.
 *       - Date must be in the future.
 *       - Action is logged in audit logs.
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
 *               - scheduled_date
 *             properties:
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Rescheduled successfully
 *       400:
 *         description: Past date or non-preventive request
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Request not found
 */
router.patch("/:id", updateRequestDetails);

export default router;
import { Router } from "express";
import { createRequest, getRequests , assignRequest , updateStatus , getCalendar, getRequestLogs } from "../controllers/request.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate());
// 7.1 Calendar View
router.get("/calendar", getCalendar);


// 4.1 Create Request (Any authenticated user can request maintenance)
router.post("/", createRequest);

// Placeholder for list
router.get("/", getRequests);


// 5.1 Assign Technician (Manager/Admin/Tech self-assign)
router.patch("/:id/assign", assignRequest);

// 6.1 Update Status (Workflow Transitions)
router.patch("/:id/status", updateStatus);

// 9.1 View Audit Logs
router.get("/:id/logs", getRequestLogs);
export default router;
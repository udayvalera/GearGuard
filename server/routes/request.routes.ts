import { Router } from "express";
import { 
    createRequest, 
    getRequests, 
    assignRequest, 
    updateStatus, 
    getCalendar,
    getRequestLogs,
    updateRequestDetails // Imported
} from "../controllers/request.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();


router.use(authenticate());

// 7.1 Calendar View
router.get("/calendar", getCalendar);

// 4.1 Create & List
router.post("/", createRequest);
router.get("/", getRequests);

// 5.1 Assign Technician
router.patch("/:id/assign", assignRequest);

// 6.1 Update Status / Workflow
router.patch("/:id/status", updateStatus);

// 9.1 View Audit Logs
router.get("/:id/logs", getRequestLogs);

// M3.2 Reschedule Request (Generic Update)
// This captures PATCH /api/v1/requests/{id}
router.patch("/:id", updateRequestDetails);

export default router;
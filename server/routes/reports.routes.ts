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
router.get("/breakdown", requireRole(Role.ADMIN),getRequestBreakdown);

export default router;

import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: RBAC Test
 *   description: Debug endpoints to verify Role-Based Access Control permissions
 */

/**
 * @swagger
 * /rbac/admin-only:
 *   get:
 *     summary: Test Admin Access
 *     description: Succeeds only if the user has the ADMIN role.
 *     tags: [RBAC Test]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome Admin!
 *                 user:
 *                   type: object
 *       403:
 *         description: Permission denied (user is not Admin)
 *       401:
 *         description: Not authenticated
 */
router.get(
  "/admin-only",
  authenticate(["ADMIN"]),
  (req: Request, res: Response) => {
    res.json({
      message: "Welcome Admin!",
      user: (req as any).user
    });
  }
);

/**
 * @swagger
 * /rbac/tech-only:
 *   get:
 *     summary: Test Technician Access
 *     description: Succeeds only if the user has the TECHNICIAN role.
 *     tags: [RBAC Test]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome Technician!
 *                 user:
 *                   type: object
 *       403:
 *         description: Permission denied (user is not Technician)
 *       401:
 *         description: Not authenticated
 */
router.get(
  "/tech-only",
  authenticate(["TECHNICIAN"]),
  (req: Request, res: Response) => {
    res.json({
      message: "Welcome Technician!",
      user: (req as any).user
    });
  }
);

/**
 * @swagger
 * /rbac/management:
 *   get:
 *     summary: Test Management Access
 *     description: Succeeds if user has MANAGER or ADMIN role.
 *     tags: [RBAC Test]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome Management!
 *                 user:
 *                   type: object
 *       403:
 *         description: Permission denied
 *       401:
 *         description: Not authenticated
 */
router.get(
  "/management",
  authenticate(["MANAGER", "ADMIN"]),
  (req: Request, res: Response) => {
    res.json({
      message: "Welcome Management!",
      user: (req as any).user
    });
  }
);

export default router;
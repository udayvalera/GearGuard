import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// 1. Admin Only Route
router.get("/admin-only", authenticate(['ADMIN']), (req: Request, res: Response) => {
    res.json({ 
        message: "Welcome Admin!", 
        user: (req as any).user 
    });
});

// 2. Technician Only Route
router.get("/tech-only", authenticate(['TECHNICIAN']), (req: Request, res: Response) => {
    res.json({ 
        message: "Welcome Technician!", 
        user: (req as any).user 
    });
});

// 3. Manager + Admin Route
router.get("/management", authenticate(['MANAGER', 'ADMIN']), (req: Request, res: Response) => {
    res.json({ 
        message: "Welcome Management!", 
        user: (req as any).user 
    });
});

export default router;
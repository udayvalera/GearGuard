import { Router } from "express";
import type { Request, Response } from "express";
import { signup, login, logout, getMe } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// PROTECTED: Only authenticated users can access /me
router.get("/me", authenticate(), getMe);

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Auth route working' });
});

export default router;
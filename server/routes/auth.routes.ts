import { Router } from "express";
import type { Request, Response } from "express";
import { signup, login, logout, getMe } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getMe);

// Health check for this route
router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Auth route working' });
});

export default router;
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const authenticate = (allowedRoles: string[] = []) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
            req.user = decoded;

            if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
                res.status(403).json({ error: "Access denied" });
                return;
            }

            next();
        } catch (error) {
            console.error("Authentication error:", error);
            res.status(401).json({ error: "Invalid or expired token" });
        }
    };
};

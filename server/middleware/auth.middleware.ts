import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Define the shape of the decoded token
interface DecodedToken {
    id: string;
    email: string;
    role: string;
}

export const authenticate = (allowedRoles: string[] = []) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // req.cookies requires 'cookie-parser' middleware in server.ts
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
            
            // Cast to any to assign to req.user (since it's not strictly on Request type by default without declaration merging)
            // Or ensure your types/auth.ts is loaded correctly by tsconfig
            (req as any).user = decoded;

            if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
                res.status(403).json({ error: "Access denied" });
                return;
            }

            next();
        } catch (error) {
            res.status(401).json({ error: "Invalid or expired token" });
        }
    };
};
import type { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

export const requireRole =
  (...allowedRoles: Role[]) =>
    (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    };

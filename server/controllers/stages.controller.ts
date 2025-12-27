import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 5.2 Get Maintenance Stages
export const getMaintenanceStages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stages = await prisma.maintenanceStage.findMany({
      select: {
        id: true,
        name: true,
        sequence: true,
      },
      orderBy: { sequence: "asc" },
    });

    res.json(stages);
  } catch (error) {
    console.error("Get Stages Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

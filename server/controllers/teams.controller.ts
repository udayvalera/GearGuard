import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 5.1 Get Maintenance Teams
export const getMaintenanceTeams = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const teams = await prisma.maintenanceTeam.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    res.json(teams);
  } catch (error) {
    console.error("Get Teams Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

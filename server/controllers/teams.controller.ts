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

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const team = await prisma.maintenanceTeam.create({
      data: { name },
    });
    res.status(201).json(team);
  } catch (error) {
    console.error("Create Team Error:", error);
    res.status(500).json({ message: "Failed to create team" });
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const team = await prisma.maintenanceTeam.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.json(team);
  } catch (error) {
    console.error("Update Team Error:", error);
    res.status(500).json({ message: "Failed to update team" });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.maintenanceTeam.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Delete Team Error:", error);
    res.status(500).json({ message: "Failed to delete team" });
  }
};

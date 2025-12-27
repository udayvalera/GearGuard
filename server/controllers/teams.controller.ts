import type { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";

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
        manager: {
          select: {
            id: true,
            name: true
          }
        },
        employees: {
          where: {
            role: Role.TECHNICIAN
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
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
    const { name, manager_id } = req.body;
    const team = await prisma.maintenanceTeam.create({
      data: {
        name,
        manager_id: manager_id ? Number(manager_id) : undefined
      },
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
    const { name, manager_id } = req.body;
    const team = await prisma.maintenanceTeam.update({
      where: { id: parseInt(id) },
      data: {
        name,
        manager_id: manager_id ? Number(manager_id) : null
      },
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

// Add technician to team
export const addTechnicianToTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { technician_id } = req.body;

    // Verify the employee exists and is a technician
    const employee = await prisma.employee.findUnique({
      where: { id: Number(technician_id) }
    });

    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    if (employee.role !== Role.TECHNICIAN) {
      res.status(400).json({ message: "Employee must have TECHNICIAN role to be added to a team" });
      return;
    }

    // Update the employee's team
    const updatedEmployee = await prisma.employee.update({
      where: { id: Number(technician_id) },
      data: { maintenance_team_id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.json(updatedEmployee);
  } catch (error) {
    console.error("Add Technician Error:", error);
    res.status(500).json({ message: "Failed to add technician to team" });
  }
};

// Remove technician from team
export const removeTechnicianFromTeam = async (req: Request, res: Response) => {
  try {
    const { id, technicianId } = req.params;

    // Verify the technician is part of this team
    const employee = await prisma.employee.findFirst({
      where: {
        id: Number(technicianId),
        maintenance_team_id: parseInt(id)
      }
    });

    if (!employee) {
      res.status(404).json({ message: "Technician not found in this team" });
      return;
    }

    // Remove the employee from the team
    await prisma.employee.update({
      where: { id: Number(technicianId) },
      data: { maintenance_team_id: null }
    });

    res.json({ message: "Technician removed from team successfully" });
  } catch (error) {
    console.error("Remove Technician Error:", error);
    res.status(500).json({ message: "Failed to remove technician from team" });
  }
};

// Get available technicians (not assigned to any team)
export const getAvailableTechnicians = async (req: Request, res: Response) => {
  try {
    const technicians = await prisma.employee.findMany({
      where: {
        role: Role.TECHNICIAN,
        maintenance_team_id: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: { name: "asc" }
    });

    res.json(technicians);
  } catch (error) {
    console.error("Get Available Technicians Error:", error);
    res.status(500).json({ message: "Failed to fetch available technicians" });
  }
};

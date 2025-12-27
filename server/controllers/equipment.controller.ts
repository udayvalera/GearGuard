import type { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

// 3.1 Create Equipment (M6.1 Manager Enforcement)
export const createEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
        // FIX: Extract user here so it is available for validation
        const user = (req as any).user;
        
        const { 
            name, serial_number, location, category_id, 
            maintenance_team_id, default_technician_id, department_id, employee_id 
        } = req.body;

        // Basic Validation
        if (!name || !serial_number || !maintenance_team_id || !category_id) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        // M6.1: Manager Team Enforcement
        // Manager can only create equipment for THEIR team
        if (user.role === 'MANAGER') {
            const emp = await prisma.employee.findUnique({ where: { id: user.id } });
            if (!emp || emp.maintenance_team_id !== maintenance_team_id) {
                res.status(403).json({ error: "Managers can only create equipment for their own maintenance team." });
                return;
            }
        }

        // Validate Technician belongs to Team
        if (default_technician_id) {
            const tech = await prisma.employee.findFirst({
                where: { 
                    id: default_technician_id,
                    maintenance_team_id: maintenance_team_id 
                }
            });
            if (!tech) {
                res.status(400).json({ error: "Default technician does not belong to the selected maintenance team" });
                return;
            }
        }

        const equipment = await prisma.equipment.create({
            data: {
                name,
                serial_number,
                location,
                category_id,
                maintenance_team_id,
                default_technician_id,
                department_id,
                employee_id
            }
        });

        res.status(201).json(equipment);
    } catch (error: any) {
        if (error.code === 'P2002') {
             res.status(409).json({ error: "Serial number must be unique" });
             return;
        }
        console.error("Create Equipment Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 3.2 Get List (With Role-Based Visibility)
export const getEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        const { page = "1", limit = "10", search, department_id } = req.query;
        
        const skip = (Number(page) - 1) * Number(limit);
        
        // Build Where Clause
        const where: any = { is_active: true };

        // Role-Based Filter
        // MANAGER & TECHNICIAN: See only their team's equipment
        if (user.role === 'TECHNICIAN' || user.role === 'MANAGER') {
            const employee = await prisma.employee.findUnique({ where: { id: user.id } });
            if (employee?.maintenance_team_id) {
                where.maintenance_team_id = employee.maintenance_team_id;
            }
        } 
        // EMPLOYEE: Sees ONLY equipment assigned to them (Owner)
        else if (user.role === 'EMPLOYEE') {
            where.employee_id = user.id;
        }
        // ADMIN sees all (no extra filter)

        // Search Filter
        if (search) {
            where.OR = [
                { name: { contains: String(search), mode: 'insensitive' } },
                { serial_number: { contains: String(search), mode: 'insensitive' } }
            ];
        }

        if (department_id) {
            where.department_id = Number(department_id);
        }

        const [total, data] = await prisma.$transaction([
            prisma.equipment.count({ where }),
            prisma.equipment.findMany({
                where,
                skip,
                take: Number(limit),
                include: {
                    category: true,
                    maintenance_team: { select: { name: true } },
                    department: { select: { name: true } },
                    employee: { select: { name: true } } // Owner name
                },
                orderBy: { created_at: 'desc' }
            })
        ]);

        res.json({
            data,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get Equipment Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 3.3 Equipment Stats (Smart Button)
export const getEquipmentStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        
        const [total, open] = await prisma.$transaction([
            prisma.maintenanceRequest.count({ where: { equipment_id: id } }),
            prisma.maintenanceRequest.count({ 
                where: { 
                    equipment_id: id,
                    stage: { name: { in: ['New', 'In Progress'] } }
                } 
            })
        ]);

        res.json({
            equipment_id: id,
            total_requests: total,
            open_requests: open,
            status: open > 0 ? 'Maintenance Required' : 'Operational'
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 3.4 Equipment Requests History
export const getEquipmentRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        
        const requests = await prisma.maintenanceRequest.findMany({
            where: { equipment_id: id },
            include: {
                stage: true,
                technician: { select: { name: true } },
                created_by: { select: { name: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
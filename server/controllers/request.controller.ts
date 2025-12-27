import type { Request, Response } from "express";
import { PrismaClient, RequestType } from "@prisma/client";

const prisma = new PrismaClient();

// 4.1 Create Request
export const createRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        const { subject, request_type, scheduled_date, equipment_id, duration_hours } = req.body;

        if (!subject || !request_type || !equipment_id) {
            res.status(400).json({ error: "Missing required fields: subject, request_type, equipment_id" });
            return;
        }

        // Validate Preventive Date
        if (request_type === RequestType.PREVENTIVE) {
            if (!scheduled_date) {
                res.status(400).json({ error: "Scheduled date is mandatory for Preventive requests" });
                return;
            }
            
            // M2.2 Rule: Cannot schedule in the past
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day
            const scheduled = new Date(scheduled_date);

            if (scheduled < today) {
                res.status(400).json({ error: "Cannot schedule Preventive Maintenance in the past." });
                return;
            }
        }

        const equipment = await prisma.equipment.findUnique({
            where: { id: equipment_id },
            include: { maintenance_team: true }
        });

        if (!equipment) {
            res.status(404).json({ error: "Equipment not found" });
            return;
        }

        if (!equipment.is_active) {
            res.status(409).json({ error: "Conflict: Cannot create request for SCRAPPED equipment" });
            return;
        }

        const newStage = await prisma.maintenanceStage.findUnique({ where: { name: 'New' } });
        if (!newStage) throw new Error("Stage 'New' not found in DB seed");

        const team_id = equipment.maintenance_team_id;
        const technician_id = equipment.default_technician_id || null;

        const newRequest = await prisma.maintenanceRequest.create({
            data: {
                subject,
                request_type,
                scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
                duration_hours,
                equipment_id,
                team_id,
                technician_id,
                stage_id: newStage.id,
                created_by_id: user.id
            }
        });

        res.status(201).json(newRequest);

    } catch (error) {
        console.error("Create Request Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 8.1 List Requests (With Role + Overdue Logic)
export const getRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        const { page = "1", limit = "10", status, equipment_id } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};

        if (status) where.stage = { name: String(status) };
        if (equipment_id) where.equipment_id = Number(equipment_id);

        // MANAGER & TECHNICIAN: See only their team's requests
        if (user.role === 'TECHNICIAN' || user.role === 'MANAGER') {
            const emp = await prisma.employee.findUnique({ where: { id: user.id } });
            if (emp?.maintenance_team_id) where.team_id = emp.maintenance_team_id;
        } 
        // EMPLOYEE: Sees only requests they created
        else if (user.role === 'EMPLOYEE') {
            where.created_by_id = user.id;
        }
        // ADMIN sees all

        const [total, requests] = await prisma.$transaction([
            prisma.maintenanceRequest.count({ where }),
            prisma.maintenanceRequest.findMany({
                where,
                skip,
                take: Number(limit),
                include: {
                    stage: true,
                    equipment: { select: { name: true, serial_number: true } },
                    technician: { select: { name: true } },
                    team: { select: { name: true } }
                },
                orderBy: { created_at: 'desc' }
            })
        ]);

        const today = new Date();
        const enrichedData = requests.map(req => {
            let is_overdue = false;
            if (
                req.request_type === 'PREVENTIVE' && 
                req.scheduled_date && 
                new Date(req.scheduled_date) < today &&
                !['Repaired', 'Scrap'].includes(req.stage.name)
            ) {
                is_overdue = true;
            }
            return { ...req, is_overdue };
        });

        res.json({
            data: enrichedData,
            meta: { total, page: Number(page), limit: Number(limit) }
        });
    } catch (error) {
        console.error("List Requests Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 5.1 Assign Request
export const assignRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const requestId = Number(req.params.id);
        const { technician_id } = req.body;
        const user = (req as any).user; 

        if (!technician_id) {
            res.status(400).json({ error: "Technician ID is required" });
            return;
        }

        const request = await prisma.maintenanceRequest.findUnique({
            where: { id: requestId },
            include: { stage: true }
        });

        if (!request) {
            res.status(404).json({ error: "Request not found" });
            return;
        }

        const technician = await prisma.employee.findUnique({
            where: { id: technician_id }
        });

        if (!technician) {
            res.status(404).json({ error: "Technician not found" });
            return;
        }

        if (technician.maintenance_team_id !== request.team_id) {
            res.status(403).json({ 
                error: "Invalid Assignment: Technician does not belong to the assigned maintenance team." 
            });
            return;
        }

        let newStageId = request.stage_id;
        if (request.stage.name === 'New') {
            const inProgressStage = await prisma.maintenanceStage.findUnique({ where: { name: 'In Progress' } });
            if (inProgressStage) newStageId = inProgressStage.id;
        }

        const updatedRequest = await prisma.$transaction([
            prisma.maintenanceRequest.update({
                where: { id: requestId },
                data: { 
                    technician_id,
                    stage_id: newStageId
                }
            }),
            prisma.maintenanceLog.create({
                data: {
                    request_id: requestId,
                    equipment_id: request.equipment_id,
                    message: `Assigned to technician: ${technician.name}`,
                    created_by_id: user.id
                }
            })
        ]);

        res.json({ message: "Assignment successful", request: updatedRequest[0] });

    } catch (error) {
        console.error("Assignment Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 6.1 Update Request Status
export const updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const requestId = Number(req.params.id);
        const { stage_id, duration_hours } = req.body;
        const user = (req as any).user;

        if (!stage_id) {
            res.status(400).json({ error: "Stage ID is required" });
            return;
        }

        const request = await prisma.maintenanceRequest.findUnique({
            where: { id: requestId },
            include: { stage: true, equipment: true }
        });

        if (!request) {
            res.status(404).json({ error: "Request not found" });
            return;
        }

        const targetStage = await prisma.maintenanceStage.findUnique({
            where: { id: stage_id }
        });

        if (!targetStage) {
            res.status(404).json({ error: "Invalid Stage ID" });
            return;
        }

        const currentName = request.stage.name;
        const targetName = targetStage.name;

        if (targetStage.is_scrap_state) {
            if (!['MANAGER', 'ADMIN'].includes(user.role)) {
                res.status(403).json({ error: "Only Managers or Admins can scrap equipment." });
                return;
            }

            await prisma.$transaction([
                prisma.maintenanceRequest.update({
                    where: { id: requestId },
                    data: { 
                        stage_id,
                        closed_at: new Date()
                    }
                }),
                prisma.equipment.update({
                    where: { id: request.equipment_id },
                    data: { is_active: false }
                }),
                prisma.maintenanceLog.create({
                    data: {
                        request_id: requestId,
                        equipment_id: request.equipment_id,
                        message: `EQUIPMENT SCRAPPED via Request #${requestId}`,
                        created_by_id: user.id
                    }
                })
            ]);
            
            res.json({ message: "Equipment Scrapped and Request Closed" });
            return;
        }

        if (targetName === 'Repaired') {
            if (!duration_hours && !request.duration_hours) {
                res.status(400).json({ error: "Duration (hours) is required when marking as Repaired" });
                return;
            }

            if (currentName !== 'In Progress') {
                res.status(400).json({ error: "Invalid Transition: Must be 'In Progress' before 'Repaired'" });
                return;
            }

            await prisma.$transaction([
                prisma.maintenanceRequest.update({
                    where: { id: requestId },
                    data: { 
                        stage_id,
                        duration_hours: duration_hours || request.duration_hours,
                        closed_at: new Date()
                    }
                }),
                prisma.maintenanceLog.create({
                    data: {
                        request_id: requestId,
                        equipment_id: request.equipment_id,
                        message: `Work completed. Duration: ${duration_hours || request.duration_hours} hrs`,
                        created_by_id: user.id
                    }
                })
            ]);

            res.json({ message: "Maintenance Completed" });
            return;
        }

        if (currentName === 'New' && targetName === 'Repaired') {
             res.status(400).json({ error: "Cannot jump from New to Repaired. Assign a technician first." });
             return;
        }

        await prisma.maintenanceRequest.update({
            where: { id: requestId },
            data: { stage_id }
        });

        await prisma.maintenanceLog.create({
            data: {
                request_id: requestId,
                equipment_id: request.equipment_id,
                message: `Stage changed from ${currentName} to ${targetName}`,
                created_by_id: user.id
            }
        });

        res.json({ message: "Status updated" });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 9.1 Get Logs
export const getRequestLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const requestId = Number(req.params.id);
        
        const logs = await prisma.maintenanceLog.findMany({
            where: { request_id: requestId },
            include: {
                created_by: { select: { name: true, role: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 7.1 Calendar View
export const getCalendar = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        const { start, end } = req.query;

        if (!start || !end) {
            res.status(400).json({ error: "Start and End dates are required (YYYY-MM-DD)" });
            return;
        }

        const where: any = {
            request_type: 'PREVENTIVE',
            scheduled_date: {
                gte: new Date(String(start)),
                lte: new Date(String(end))
            }
        };

        // MANAGER & TECHNICIAN: See only their team's schedule
        if (user.role === 'TECHNICIAN' || user.role === 'MANAGER') {
            const employee = await prisma.employee.findUnique({ where: { id: user.id } });
            if (employee?.maintenance_team_id) {
                where.team_id = employee.maintenance_team_id;
            }
        }

        const events = await prisma.maintenanceRequest.findMany({
            where,
            select: {
                id: true,
                subject: true,
                scheduled_date: true,
                stage: { select: { name: true } },
                equipment: { select: { name: true, location: true } },
                technician: { select: { name: true } }
            },
            orderBy: { scheduled_date: 'asc' }
        });

        res.json(events);

    } catch (error) {
        console.error("Calendar Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
// M3.2 Update Request Details (Rescheduling)
export const updateRequestDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const requestId = Number(req.params.id);
        const { scheduled_date } = req.body;
        const user = (req as any).user;

        // 1. Fetch Request
        const request = await prisma.maintenanceRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) {
            res.status(404).json({ error: "Request not found" });
            return;
        }

        // 2. Handle Rescheduling
        if (scheduled_date) {
            // Only allowed for Preventive Requests (usually)
            if (request.request_type !== 'PREVENTIVE') {
                res.status(400).json({ error: "Only Preventive requests can be rescheduled." });
                return;
            }

            // Validate Future Date
            const newDate = new Date(scheduled_date);
            const today = new Date();
            today.setHours(0,0,0,0);

            if (newDate < today) {
                res.status(400).json({ error: "Cannot reschedule to a past date." });
                return;
            }

            // Transaction: Update + Log
            await prisma.$transaction([
                prisma.maintenanceRequest.update({
                    where: { id: requestId },
                    data: { scheduled_date: newDate }
                }),
                prisma.maintenanceLog.create({
                    data: {
                        request_id: requestId,
                        equipment_id: request.equipment_id,
                        message: `Rescheduled to ${newDate.toISOString().split('T')[0]}`,
                        created_by_id: user.id
                    }
                })
            ]);

            res.json({ message: "Request rescheduled successfully" });
            return;
        }

        res.status(400).json({ error: "No updateable fields provided" });

    } catch (error) {
        console.error("Update Details Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


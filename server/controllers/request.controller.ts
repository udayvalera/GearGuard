import type { Request, Response } from "express";
import { PrismaClient, RequestType } from "@prisma/client";

const prisma = new PrismaClient();

// 4.1 Create Request
export const createRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        const { subject, request_type, scheduled_date, equipment_id, duration_hours } = req.body;

        // 1. Basic Validation
        if (!subject || !request_type || !equipment_id) {
            res.status(400).json({ error: "Missing required fields: subject, request_type, equipment_id" });
            return;
        }

        // 2. Validate Request Type & Date
        if (request_type === RequestType.PREVENTIVE && !scheduled_date) {
             res.status(400).json({ error: "Scheduled date is mandatory for Preventive requests" });
             return;
        }

        // 3. Fetch Equipment (and check if it exists + is active)
        const equipment = await prisma.equipment.findUnique({
            where: { id: equipment_id },
            include: { maintenance_team: true }
        });

        if (!equipment) {
            res.status(404).json({ error: "Equipment not found" });
            return;
        }

        // 4. Critical Rule: Cannot create request for Scrapped equipment
        if (!equipment.is_active) {
            res.status(400).json({ error: "Cannot create request for SCRAPPED equipment" });
            return;
        }

        // 5. Fetch Initial Stage (New)
        const newStage = await prisma.maintenanceStage.findUnique({ where: { name: 'New' } });
        if (!newStage) throw new Error("Stage 'New' not found in DB seed");

        // 6. Auto-fill Logic
        // Team comes from Equipment
        const team_id = equipment.maintenance_team_id;
        
        // Default Technician (Optional auto-fill)
        const technician_id = equipment.default_technician_id || null;

        // 7. Create Request
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

// Placeholder for List API (Phase 5)
export const getRequests = async (req: Request, res: Response) => {
    res.json({ message: "List API coming in Phase 5" });
};
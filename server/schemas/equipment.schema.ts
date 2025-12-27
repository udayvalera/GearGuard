import { z } from 'zod';

export const createEquipmentSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name is required"),
        serial_number: z.string().min(1, "Serial number is required"),
        location: z.string().min(1, "Location is required"),
        category_id: z.number({ required_error: "Category ID is required" }).int().positive(),
        maintenance_team_id: z.number({ required_error: "Maintenance Team ID is required" }).int().positive(),
        default_technician_id: z.number().int().positive().optional(),
        department_id: z.number().int().positive().optional(),
        employee_id: z.number().int().positive().optional()
    })
});

export const assignEquipmentSchema = z.object({
    body: z.object({
        employee_id: z.number().int().positive().nullable()
    })
});
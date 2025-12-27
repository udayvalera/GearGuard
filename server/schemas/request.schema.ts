import { z } from 'zod';
import { RequestType } from '@prisma/client';

export const createRequestSchema = z.object({
    body: z.object({
        subject: z.string().min(3, "Subject is required"),
        request_type: z.nativeEnum(RequestType),
        equipment_id: z.number({ required_error: "Equipment ID is required" }).int().positive(),
        scheduled_date: z.string().optional().refine((date) => {
            // If provided, must be a valid date
            if (!date) return true;
            return !isNaN(Date.parse(date));
        }, "Invalid date format"),
        duration_hours: z.number().positive().optional()
    })
}).superRefine((data, ctx) => {
    // Custom Logic: Preventive REQUIRES future scheduled_date
    if (data.body.request_type === 'PREVENTIVE') {
        if (!data.body.scheduled_date) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Scheduled date is mandatory for Preventive requests",
                path: ['body', 'scheduled_date']
            });
            return; // Stop further checks if missing
        }
        
        const scheduled = new Date(data.body.scheduled_date);
        const today = new Date();
        today.setHours(0,0,0,0);
        
        if (scheduled < today) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Cannot schedule Preventive Maintenance in the past",
                path: ['body', 'scheduled_date']
            });
        }
    }
});

export const assignRequestSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number")
    }),
    body: z.object({
        technician_id: z.number({ required_error: "Technician ID is required" }).int().positive()
    })
});

export const updateStatusSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number")
    }),
    body: z.object({
        stage_id: z.number({ required_error: "Stage ID is required" }).int().positive(),
        duration_hours: z.number().positive().optional()
    })
});
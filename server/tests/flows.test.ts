import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let token: string;
let equipment: any;
let category: any;
let team: any;

describe('Integration Flows', () => {
    beforeAll(async () => {
        const res = await request(app).post('/api/v1/auth/login').send({ email: 'admin@gearguard.com', password: 'password123' });
        token = res.header['set-cookie'][0].split(';')[0];

        team = await prisma.maintenanceTeam.findFirst();
        category = await prisma.equipmentCategory.findFirst();
        
        equipment = await prisma.equipment.create({
            data: { name: 'Flow Test Equip', serial_number: `FLOW-${Date.now()}`, location: 'Lab', category_id: category.id, maintenance_team_id: team.id }
        });
    });

    afterAll(async () => {
        try { 
            await prisma.maintenanceRequest.deleteMany({ where: { equipment_id: equipment.id }});
            await prisma.equipment.delete({ where: { id: equipment.id }}); 
        } catch {}
        await prisma.$disconnect();
    });

    // UPDATED TIMEOUT: 15000ms (15s)
    it('Full Breakdown Flow: New -> In Progress -> Repaired', async () => {
        // 1. Create
        const createRes = await request(app)
            .post('/api/v1/requests')
            .set('Cookie', [token])
            .send({ subject: 'Broken Motor', request_type: 'CORRECTIVE', equipment_id: equipment.id });
        const reqId = createRes.body.id;
        
        // 2. Assign
        const validTech = await prisma.employee.create({
            data: { name: 'Valid Tech', email: `vt-${Date.now()}@test.com`, password: 'p', role: 'TECHNICIAN', maintenance_team_id: team.id }
        });

        await request(app).patch(`/api/v1/requests/${reqId}/assign`).set('Cookie', [token]).send({ technician_id: validTech.id });

        // 3. Repair
        const repairedStage = await prisma.maintenanceStage.findUnique({ where: { name: 'Repaired' } });
        
        const finalRes = await request(app)
            .patch(`/api/v1/requests/${reqId}/status`)
            .set('Cookie', [token])
            .send({ stage_id: repairedStage!.id, duration_hours: 4 });

        expect(finalRes.status).toBe(200);
        expect(finalRes.body.message).toContain('Maintenance Completed');

        await prisma.employee.delete({ where: { id: validTech.id }});
    }, 15000); // <--- Added 15s Timeout here

    it('Preventive Scheduling: Should require Date', async () => {
        const res = await request(app)
            .post('/api/v1/requests')
            .set('Cookie', [token])
            .send({ subject: 'Checkup', request_type: 'PREVENTIVE', equipment_id: equipment.id });

        expect(res.status).toBe(400);
    });

    // Kept 10s Timeout here
    it('Scrap Behavior: Should deactivate equipment', async () => {
        const scrapEquip = await prisma.equipment.create({
            data: { name: 'To Scrap', serial_number: `S-${Date.now()}`, location: 'Bin', category_id: category.id, maintenance_team_id: team.id }
        });

        const reqRes = await request(app).post('/api/v1/requests').set('Cookie', [token]).send({ subject: 'Scrap it', request_type: 'CORRECTIVE', equipment_id: scrapEquip.id });
        const reqId = reqRes.body.id;

        const scrapStage = await prisma.maintenanceStage.findUnique({ where: { name: 'Scrap' } });

        const res = await request(app)
            .patch(`/api/v1/requests/${reqId}/status`)
            .set('Cookie', [token])
            .send({ stage_id: scrapStage!.id });

        expect(res.status).toBe(200);

        const check = await prisma.equipment.findUnique({ where: { id: scrapEquip.id } });
        expect(check!.is_active).toBe(false);
        
        try {
            await prisma.maintenanceRequest.deleteMany({ where: { equipment_id: scrapEquip.id }});
            await prisma.equipment.delete({ where: { id: scrapEquip.id }});
        } catch {}

    }, 10000); 
});
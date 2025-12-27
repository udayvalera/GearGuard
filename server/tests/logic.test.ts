import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let token: string;
let teamA: any;
let teamB: any;
let techB: any;
let equipment: any;

describe('Unit Logic & Enforcement', () => {
    beforeAll(async () => {
        teamA = await prisma.maintenanceTeam.upsert({ where: { name: 'Test Team A' }, update: {}, create: { name: 'Test Team A' }});
        teamB = await prisma.maintenanceTeam.upsert({ where: { name: 'Test Team B' }, update: {}, create: { name: 'Test Team B' }});
        
        techB = await prisma.employee.create({
            data: { name: 'Tech B', email: `test-techb-${Date.now()}@test.com`, password: 'pass', maintenance_team_id: teamB.id, role: 'TECHNICIAN' }
        });

        const cat = await prisma.equipmentCategory.findFirst();
        equipment = await prisma.equipment.create({
            data: { name: 'Unit Test Equip', serial_number: `UT-${Date.now()}`, location: 'Lab', category_id: cat!.id, maintenance_team_id: teamA.id }
        });

        const res = await request(app).post('/api/v1/auth/login').send({ email: 'admin@gearguard.com', password: 'password123' });
        token = res.header['set-cookie'][0].split(';')[0];
    });

    afterAll(async () => {
        // FIX 1: Cleanup requests BEFORE equipment
        try {
            await prisma.maintenanceRequest.deleteMany({ where: { equipment_id: equipment.id }});
            await prisma.equipment.delete({ where: { id: equipment.id }});
            await prisma.employee.delete({ where: { id: techB.id }});
        } catch (e) {
            console.log('Cleanup warning:', e.message);
        }
        await prisma.$disconnect();
    });

    it('Should Auto-fill Team ID from Equipment', async () => {
        const res = await request(app)
            .post('/api/v1/requests')
            .set('Cookie', [token])
            .send({
                subject: 'Auto-fill Test',
                request_type: 'CORRECTIVE',
                equipment_id: equipment.id
            });

        expect(res.status).toBe(201);
        expect(res.body.team_id).toBe(teamA.id);
    });

    it('Should Enforce Team Rules (Prevent Cross-Team Assignment)', async () => {
        const reqRes = await request(app)
            .post('/api/v1/requests')
            .set('Cookie', [token])
            .send({ subject: 'Assignment Test', request_type: 'CORRECTIVE', equipment_id: equipment.id });
        
        const reqId = reqRes.body.id;

        const res = await request(app)
            .patch(`/api/v1/requests/${reqId}/assign`)
            .set('Cookie', [token])
            .send({ technician_id: techB.id });

        expect(res.status).toBe(403);
    });
});
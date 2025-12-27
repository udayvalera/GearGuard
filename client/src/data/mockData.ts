import type { User, Team, Equipment, MaintenanceRequest, LogEntry } from '../types';

// Helper to generate IDs
const generateId = (prefix: string, index: number) => `${prefix}-${String(index + 1).padStart(3, '0')}`;

// Mock Users (Technicians & Managers)
export const MOCK_USERS: User[] = [
    { id: 'usr-001', name: 'Alice Manager', role: 'MANAGER', email: 'alice@gearguard.com', avatarUrl: 'https://i.pravatar.cc/150?u=usr-001' },
    { id: 'tech-001', name: 'Bob Fixer', role: 'TECHNICIAN', email: 'bob@gearguard.com', avatarUrl: 'https://i.pravatar.cc/150?u=tech-001' },
    { id: 'tech-002', name: 'Charlie Wrench', role: 'TECHNICIAN', email: 'charlie@gearguard.com', avatarUrl: 'https://i.pravatar.cc/150?u=tech-002' },
    { id: 'tech-003', name: 'Dana Spark', role: 'TECHNICIAN', email: 'dana@gearguard.com', avatarUrl: 'https://i.pravatar.cc/150?u=tech-003' },
    { id: 'tech-004', name: 'Evan Gear', role: 'TECHNICIAN', email: 'evan@gearguard.com', avatarUrl: 'https://i.pravatar.cc/150?u=tech-004' },
];

export const CURRENT_USER_ID = 'usr-001';

// Mock Teams
export const MOCK_TEAMS: Team[] = [
    { id: 'team-A', name: 'Alpha Squad', technicianIds: ['tech-001', 'tech-002'] },
    { id: 'team-B', name: 'Beta Force', technicianIds: ['tech-003', 'tech-004'] },
];

// Mock Equipment
// Generate 15 items, 2 scrapped
export const MOCK_EQUIPMENT: Equipment[] = Array.from({ length: 15 }).map((_, i) => {
    const isScrapped = i < 2; // First 2 are scrapped
    const id = generateId('eq', i);

    return {
        id,
        name: `Industrial Pump X-${1000 + i}`,
        serialNumber: `SN-${2024}-${100 + i}`,
        location: i % 2 === 0 ? 'Factory Floor A' : 'Warehouse B',
        teamId: i % 3 === 0 ? 'team-A' : 'team-B', // Distribute teams
        defaultTechnicianId: isScrapped ? undefined : MOCK_USERS[1 + (i % 4)].id, // Assign random tech
        isActive: !isScrapped,
        status: isScrapped ? 'Scrapped' : (i % 5 === 0 ? 'Under Maintenance' : 'Operational'),
    };
});

// Mock Requests
// Generate 20+ requests
const PRIORITIES = ['Low', 'Medium', 'High'] as const;
const TYPES = ['Corrective', 'Preventive'] as const;
const STATUSES = ['New', 'In Progress', 'Repaired', 'Scrap'] as const;

export const MOCK_REQUESTS: MaintenanceRequest[] = Array.from({ length: 22 }).map((_, i) => {
    const id = generateId('req', i);
    // Distribute statuses
    let status = STATUSES[i % 4];
    const isScrapReq = status === 'Scrap';

    // If it's a scrap request, link to one of the seeded scrapped items if possible, or just random
    const equipment = isScrapReq && i < 2 ? MOCK_EQUIPMENT[i] : MOCK_EQUIPMENT[i % MOCK_EQUIPMENT.length];

    // Ensure consistency: if request is Scrap, equipment should be scrapped/inactive (in a real app, but this is init data)
    // For the sake of the mock, let's align them roughly, but the Context will enforce the logic on change.

    const daysOffset = (i % 10) - 5; // -5 to +4 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysOffset);

    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - 10 + daysOffset);

    const logs: LogEntry[] = [
        {
            id: generateId('log', i),
            timestamp: createdDate.toISOString(),
            message: 'Request created via System',
            authorId: 'system',
        }
    ];

    return {
        id,
        equipmentId: equipment.id,
        title: `${TYPES[i % 2]} Maintenance: ${equipment.name}`,
        description: `Reported issue with ${equipment.name}. Standard protocols apply.`,
        priority: PRIORITIES[i % 3],
        type: TYPES[i % 2],
        status: status,
        assignedTechId: status === 'New' ? undefined : (equipment.defaultTechnicianId || 'tech-001'),
        dueDate: dueDate.toISOString(),
        createdAt: createdDate.toISOString(),
        logs,
    };
});

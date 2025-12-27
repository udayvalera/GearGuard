export type UserRole = 'Manager' | 'Technician' | 'Employee';

export interface User {
    id: string;
    name: string;
    role: UserRole;
    avatarUrl?: string; // Optional URL for avatar image
}

export interface Team {
    id: string;
    name: string;
    technicianIds: string[];
}

export type EquipmentStatus = 'Operational' | 'Scrapped' | 'Under Maintenance';

export interface Equipment {
    id: string;
    name: string;
    serialNumber: string;
    location: string;
    teamId: string;
    defaultTechnicianId?: string;
    isActive: boolean;
    status: EquipmentStatus;
}

export type RequestPriority = 'Low' | 'Medium' | 'High';
export type RequestType = 'Corrective' | 'Preventive';
export type RequestStatus = 'New' | 'In Progress' | 'Repaired' | 'Scrap';

export interface LogEntry {
    id: string;
    timestamp: string; // ISO Date string
    message: string;
    authorId: string;
}

export interface MaintenanceRequest {
    id: string;
    equipmentId: string;
    title: string;
    description: string;
    priority: RequestPriority;
    type: RequestType;
    status: RequestStatus;
    assignedTechId?: string;
    dueDate: string; // ISO Date string
    createdAt: string; // ISO Date string
    logs: LogEntry[];
}

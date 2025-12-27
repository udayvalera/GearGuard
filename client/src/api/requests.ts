import client from './client';
import type { MaintenanceRequest, RequestPriority, RequestType, RequestStatus } from '../types';

// DTOs to match backend snake_case response
export interface RequestDTO {
    id: number;
    subject: string;
    description?: string;
    priority?: string;
    request_type: string;
    status: string;
    equipment_id: number;
    assigned_technician_id?: number;
    scheduled_date?: string;
    created_at: string;
    logs?: LogEntryDTO[];
    equipment?: {
        name: string;
        location?: string;
    };
}

export interface LogEntryDTO {
    id: number;
    message: string;
    created_at: string;
    created_by: {
        name: string;
        role: string;
    };
}

// Mapper function
const mapRequestDTOtoModel = (dto: RequestDTO): MaintenanceRequest => {
    return {
        id: String(dto.id),
        equipmentId: String(dto.equipment_id),
        title: dto.subject,
        description: dto.description || '', // Backend might not always send this in list view
        priority: (dto.priority || 'Medium') as RequestPriority,
        type: (dto.request_type === 'CORRECTIVE' ? 'Corrective' : 'Preventive') as RequestType, // Normalize case if needed
        status: dto.status as RequestStatus,
        assignedTechId: dto.assigned_technician_id ? String(dto.assigned_technician_id) : undefined,
        dueDate: dto.scheduled_date || '',
        createdAt: dto.created_at,
        logs: dto.logs ? dto.logs.map(log => ({
            id: String(log.id),
            timestamp: log.created_at,
            message: log.message,
            authorId: log.created_by.name // Using name as authorId for display simplicity or need mapped ID
        })) : []
    };
};

export const fetchRequests = async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const response = await client.get<{ data: RequestDTO[]; meta: any }>('/requests', { params });
    return {
        data: response.data.data.map(mapRequestDTOtoModel),
        meta: response.data.meta
    };
};

export const fetchRequestById = async (_id: string) => {
    // Assuming backend has a get-by-id endpoint, otherwise we rely on list or logs endpoint
    // Based on routes found, there isn't a direct GET /requests/:id documented in swagger routes file shown?
    // Wait, checked request.routes.ts:
    // GET /requests (list)
    // GET /requests/:id/logs
    // PATCH /requests/:id
    // It seems there might be a missing single GET, or we rely on the list.
    // For now, I will assume we might need to filter the list or just use what we have.
    // Actually, usually a detail view is needed. 
    // Let's implement creating a request which is definitely needed.
    return null;
};

export const createRequest = async (data: {
    subject: string;
    request_type: 'CORRECTIVE' | 'PREVENTIVE';
    equipment_id: number;
    description?: string;
    priority?: string;
}) => {
    const response = await client.post<RequestDTO>('/requests', data);
    return mapRequestDTOtoModel(response.data);
};

export const fetchRequestLogs = async (id: string) => {
    const response = await client.get<LogEntryDTO[]>(`/requests/${id}/logs`);
    return response.data.map(log => ({
        id: String(log.id),
        timestamp: log.created_at,
        message: log.message,
        authorId: log.created_by.name
    }));
};

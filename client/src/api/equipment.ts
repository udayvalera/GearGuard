import client from './client';
import type { Equipment, EquipmentStatus } from '../types';

export interface EquipmentDTO {
    id: number;
    name: string;
    serial_number: string;
    location?: string;
    is_active: boolean;
    status?: string; // e.g. "Operational", "Maintenance Required" based on stats or status field
    maintenance_team_id?: number;
    category_id?: number;
    category?: {
        name: string;
    };
    maintenance_team?: {
        name: string;
    };
}

const mapEquipmentDTOtoModel = (dto: EquipmentDTO): Equipment => {
    return {
        id: String(dto.id),
        name: dto.name,
        serialNumber: dto.serial_number,
        location: dto.location || 'Unknown',
        teamId: dto.maintenance_team_id ? String(dto.maintenance_team_id) : '',
        isActive: dto.is_active,
        status: (dto.status || 'Operational') as EquipmentStatus,
        // Note: Backend might calculate status dynamically or store it. 
        // If not provided, defaulting to Operational.
    };
};

export const fetchEquipment = async (params: { search?: string; page?: number; limit?: number } = {}) => {
    const response = await client.get<{ data: EquipmentDTO[]; meta: any }>('/equipment', { params });
    return {
        data: response.data.data.map(mapEquipmentDTOtoModel),
        meta: response.data.meta
    };
};

export const fetchEquipmentStats = async (id: string) => {
    const response = await client.get<{ equipment_id: number; total_requests: number; open_requests: number; status: string }>(`/equipment/${id}/stats`);
    return response.data;
};

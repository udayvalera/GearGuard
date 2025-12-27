export interface MaintenanceLogEntity {
  id: number;
  message: string;
  created_at: Date;

  request_id?: number | null;
  equipment_id?: number | null;
  created_by_id?: number | null;
}

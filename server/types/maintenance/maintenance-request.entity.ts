import { RequestType } from "../enums/request-type.js";

export interface MaintenanceRequestEntity {
  id: number;
  subject: string;
  request_type: RequestType;

  scheduled_date?: Date | null;
  duration_hours?: number | null;

  created_at: Date;
  updated_at: Date;
  closed_at?: Date | null;

  created_by_id: number;
  equipment_id: number;
  team_id: number;
  technician_id?: number | null;
  stage_id: number;
}

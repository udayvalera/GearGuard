export interface MaintenanceStageEntity {
  id: number;
  name: string; // New, In Progress, Repaired, Scrap
  sequence: number;
  is_scrap_state: boolean;
}

export interface EquipmentEntity {
  id: number;
  name: string;
  serial_number: string;
  purchase_date?: Date | null;
  warranty_info?: string | null;
  location: string;
  is_active: boolean;

  department_id?: number | null;
  category_id: number;
  employee_id?: number | null;

  maintenance_team_id: number;
  default_technician_id?: number | null;

  created_at: Date;
  updated_at: Date;
}

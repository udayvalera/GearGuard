export interface EquipmentDTO {
  id: number;
  name: string;
  serialNumber: string;
  location: string;
  isActive: boolean;

  category: string;
  department?: string;
  owner?: string;
}

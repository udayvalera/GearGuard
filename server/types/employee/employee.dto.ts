import { Role } from "../enums/role.js";

export interface EmployeeDTO {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
}

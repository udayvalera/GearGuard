import { Role } from "../enums/role.js";

export interface EmployeeEntity {
    id: number;
    name: String;
    email: String;
    role: Role;
    avatar_url?: String | null;
    
    maintenance_team_id?: number | null;
    created_at?: Date;
}
export type Role = 'admin' | 'manager' | 'technician' | 'employee';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    maintenance_team_id?: number;
    created_at: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    token?: string; // Optional, as it's in a cookie
}

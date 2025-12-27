export interface User {
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    role: "user" | "admin";
}

export interface AuthResponse {
    message: string;
    user?: User;
    token?: string; // Optional, as it's in a cookie
}

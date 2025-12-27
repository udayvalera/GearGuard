import React, { createContext, useState, useContext, type ReactNode } from "react";
import client from "../api/client";
import type { User, AuthResponse } from "../types/auth";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    signup: (data: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const checkAuth = async () => {
        try {
            const { data } = await client.get<{ user: User }>("/auth/me");
            setUser(data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials: any) => {
        setIsLoading(true);
        try {
            const { data } = await client.post<AuthResponse>("/auth/login", credentials);
            if (data.user) {
                setUser(data.user);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (credentials: any) => {
        setIsLoading(true);
        try {
            const { data } = await client.post<AuthResponse>("/auth/signup", credentials);
            if (data.user) {
                setUser(data.user);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await client.post("/auth/logout");
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const mockLogin = async (role: string) => {
        setIsLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockUser: User = {
            id: `mock-${role}-id`,
            name: `Mock ${role.charAt(0).toUpperCase() + role.slice(1)}`,
            email: `${role}@gearguard.com`,
            role: role,
            maintenance_team_id: role === 'technician' ? 1 : undefined,
            created_at: new Date().toISOString()
        };

        setUser(mockUser);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                signup,
                logout,
                // @ts-ignore - Adding mockLogin to context value even if not in interface yet for dev speed
                mockLogin
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType & { mockLogin: (role: string) => Promise<void> } => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context as AuthContextType & { mockLogin: (role: string) => Promise<void> };
};

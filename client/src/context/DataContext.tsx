import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import client from '../api/client';
import type { User, Team, Equipment, MaintenanceRequest, RequestStatus, TeamMember } from '../types';
import { CURRENT_USER_ID } from '../data/mockData';
import { useAuth } from './AuthContext';

interface DataContextType {
    currentUser: User;
    users: User[];
    loading: boolean;
    error: string | null;
    teams: Team[];
    equipment: Equipment[];
    requests: MaintenanceRequest[];
    availableTechnicians: TeamMember[];

    // Actions
    updateRequestStatus: (id: string, status: RequestStatus) => void;
    reassignTechnician: (requestId: string, technicianId: string) => void;
    scrapEquipment: (requestId: string, equipmentId: string) => Promise<{ success: boolean; error?: string }>;
    createRequest: (req: any) => void;
    addRequest: (request: MaintenanceRequest) => void;

    // CRUD
    addUser: (user: User) => void;
    updateUser: (user: User) => void;
    addTeam: (team: Team) => void;
    updateTeam: (team: Team) => void;
    addEquipment: (equipment: Equipment) => void;
    updateEquipment: (equipment: Equipment) => void;
    assignEquipment: (equipmentId: string, employeeId: string | null) => Promise<void>;
    
    // Team Technician Management
    addTechnicianToTeam: (teamId: string, technicianId: string) => Promise<void>;
    removeTechnicianFromTeam: (teamId: string, technicianId: string) => Promise<void>;
    refreshAvailableTechnicians: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [stages, setStages] = useState<{ id: number; name: string }[]>([]);
    const [availableTechnicians, setAvailableTechnicians] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Initial Data
    useEffect(() => {
        // Wait for auth to finish loading and ensure user is authenticated
        if (authLoading || !isAuthenticated || !authUser) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const userRole = authUser.role;
                const isAdminOrManager = userRole === 'ADMIN' || userRole === 'MANAGER';
                const canAccessStages = userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'TECHNICIAN';

                // Build fetch promises based on role
                const fetchPromises: Promise<any>[] = [];
                const fetchKeys: string[] = [];

                // Admin-only: users
                if (userRole === 'ADMIN') {
                    fetchPromises.push(client.get('/users'));
                    fetchKeys.push('users');
                }

                // Admin/Manager/Technician: teams
                if (isAdminOrManager || userRole === 'TECHNICIAN') {
                    fetchPromises.push(client.get('/teams'));
                    fetchKeys.push('teams');
                }

                // All roles can access equipment
                fetchPromises.push(client.get('/equipment'));
                fetchKeys.push('equipment');

                // Admin/Manager/Technician: stages
                if (canAccessStages) {
                    fetchPromises.push(client.get('/stages'));
                    fetchKeys.push('stages');
                }

                const responses = await Promise.all(fetchPromises);
                const responseMap: Record<string, any> = {};
                fetchKeys.forEach((key, index) => {
                    responseMap[key] = responses[index].data;
                });

                // Map Backend User to Client User (only if fetched)
                if (responseMap.users) {
                    const mappedUsers = responseMap.users.map((u: any) => ({
                        id: String(u.id),
                        name: u.name,
                        role: u.role,
                        email: u.email,
                        avatarUrl: u.avatar_url
                    }));
                    setUsers(mappedUsers);
                }

                // Map teams (if fetched)
                if (responseMap.teams) {
                    const mappedTeams = responseMap.teams.map((t: any) => ({
                        id: String(t.id),
                        name: t.name,
                        technicianIds: t.employees ? t.employees.map((e: any) => String(e.id)) : [],
                        technicians: t.employees ? t.employees.map((e: any) => ({
                            id: String(e.id),
                            name: e.name,
                            email: e.email,
                            role: e.role
                        })) : [],
                        managerId: t.manager ? String(t.manager.id) : undefined,
                        managerName: t.manager ? t.manager.name : undefined
                    }));
                    setTeams(mappedTeams);
                }

                // Map equipment
                if (responseMap.equipment) {
                    const equipmentData = responseMap.equipment.data || responseMap.equipment;
                    const mappedEquipment = equipmentData.map((e: any) => ({
                        id: String(e.id),
                        name: e.name,
                        serialNumber: e.serial_number,
                        location: e.location,
                        teamId: String(e.maintenance_team_id),
                        defaultTechnicianId: e.default_technician_id ? String(e.default_technician_id) : undefined,
                        isActive: e.is_active,
                        status: e.is_active ? 'Operational' : 'Scrapped',
                        employeeId: e.employee_id ? String(e.employee_id) : undefined,
                        employeeName: e.employee ? e.employee.name : undefined
                    }));
                    setEquipment(mappedEquipment);
                }

                // Map stages (if fetched)
                if (responseMap.stages) {
                    setStages(responseMap.stages);
                } else {
                    // Set default stages for employees who can't access the stages endpoint
                    setStages([
                        { id: 1, name: 'New' },
                        { id: 2, name: 'In Progress' },
                        { id: 3, name: 'Repaired' },
                        { id: 4, name: 'Scrap' }
                    ]);
                }

                // Fetch Requests (all authenticated users can access their requests)
                const requestsRes = await client.get('/requests?limit=100');
                const requestsData = requestsRes.data.data;

                const mappedRequests = requestsData.map((r: any) => ({
                    id: String(r.id),
                    equipmentId: String(r.equipment_id),
                    equipmentName: r.equipment?.name,
                    teamId: String(r.team_id),
                    title: r.subject,
                    description: "",
                    priority: 'Medium',
                    type: r.request_type === 'PREVENTIVE' ? 'Preventive' : 'Corrective',
                    status: r.stage ? r.stage.name : 'New',
                    assignedTechId: r.technician_id ? String(r.technician_id) : undefined,
                    dueDate: r.scheduled_date || r.created_at,
                    createdAt: r.created_at,
                    logs: r.logs ? r.logs.map((l: any) => ({
                        id: String(l.id),
                        timestamp: l.created_at,
                        message: l.message,
                        authorId: String(l.created_by_id)
                    })) : [],
                    durationHours: r.duration_hours
                }));

                setRequests(mappedRequests);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [authUser, isAuthenticated, authLoading]);

    // Use authUser as currentUser, or fall back to users array if available
    const currentUser = authUser ? {
        id: String(authUser.id),
        name: authUser.name,
        role: authUser.role,
        email: authUser.email,
        avatarUrl: (authUser as any).avatar_url
    } as User : (users.find(u => u.id === CURRENT_USER_ID) || users[0]);

    const updateRequestStatus = async (requestId: string, status: RequestStatus) => {
        try {
            const targetStage = stages.find(s => s.name === status);
            if (!targetStage) {
                console.error(`Stage '${status}' not found in fetched stages.`);
                // Fallback map if fetch failed or stages missing
                const fallbackMap: Record<string, number> = { 'New': 1, 'In Progress': 2, 'Repaired': 3, 'Scrap': 4 };
                await client.patch(`/requests/${requestId}/status`, {
                    stage_id: fallbackMap[status],
                    duration_hours: 1
                });
                return;
            }

            await client.patch(`/requests/${requestId}/status`, {
                stage_id: targetStage.id,
                duration_hours: 1 // Default duration
            });

        } catch (e) {
            console.error("Failed to update status", e);
            // Revert
            // setRequests(...)
        }
    };

    const reassignTechnician = async (requestId: string, techId: string) => {
        try {
            // Optimistic update - also update status if moving from 'New' (backend auto-transitions)
            setRequests(prev => prev.map(req => {
                if (req.id === requestId) {
                    const newStatus = req.status === 'New' ? 'In Progress' : req.status;
                    return { ...req, assignedTechId: techId, status: newStatus };
                }
                return req;
            }));
            
            const response = await client.patch(`/requests/${requestId}/assign`, { technician_id: Number(techId) });
            const updatedRequest = response.data.request;
            
            // Update with actual server response (in case of any discrepancies)
            if (updatedRequest) {
                setRequests(prev => prev.map(req => {
                    if (req.id === requestId) {
                        return {
                            ...req,
                            assignedTechId: String(updatedRequest.technician_id),
                            // Note: Backend returns stage_id, we'd need to map it back to name
                            // For now the optimistic update handles the status change
                        };
                    }
                    return req;
                }));
            }
        } catch (e) {
            console.error("Failed to reassign", e);
            // Revert optimistic update on error
            setRequests(prev => prev.map(req =>
                req.id === requestId ? { ...req, assignedTechId: undefined } : req
            ));
        }
    };

    const scrapEquipment = async (requestId: string, equipmentId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Call backend to update status to Scrap
            await updateRequestStatus(requestId, 'Scrap');
            
            // Update local equipment state
            setEquipment(prev => prev.map(eq =>
                eq.id === equipmentId
                    ? { ...eq, isActive: false, status: 'Scrapped' }
                    : eq
            ));

            return { success: true };
        } catch (e: any) {
            console.error('Scrap equipment error:', e);
            const errorMessage = e.response?.data?.error || 'Failed to scrap equipment';
            return { success: false, error: errorMessage };
        }
    };

    const addRequest = (request: MaintenanceRequest) => {
        setRequests(prev => [request, ...prev]);
    };

    const createRequest = async (newRequest: any) => {
        try {
            const payload = {
                subject: newRequest.title,
                request_type: newRequest.type === 'Preventive' ? 'PREVENTIVE' : 'CORRECTIVE',
                equipment_id: Number(newRequest.equipmentId),
                scheduled_date: newRequest.dueDate,
                duration_hours: 0
            };
            const res = await client.post('/requests', payload);
            const r = res.data;

            // Map back
            const created: MaintenanceRequest = {
                id: String(r.id),
                equipmentId: String(r.equipment_id),
                teamId: String(r.team_id),
                title: r.subject,
                description: "",
                priority: 'Medium',
                type: r.request_type === 'PREVENTIVE' ? 'Preventive' : 'Corrective',
                status: 'New', // Default
                assignedTechId: undefined, // Usually default tech?
                dueDate: r.scheduled_date || new Date().toISOString(),
                createdAt: new Date().toISOString(),
                logs: []
            };
            setRequests(prev => [created, ...prev]);
        } catch (e) {
            console.error("Create request failed", e);
        }
    };

    // CRUD Implementations
    // const addUser = (user: User) => setUsers(prev => [...prev, user]); // Removed to fix Duplicate/Unused error
    // const updateUser = (updatedUser: User) => setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    // const addTeam = (team: Team) => setTeams(prev => [...prev, team]);
    // const updateTeam = (updatedTeam: Team) => setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));

    const addEquipment = (eq: Equipment) => setEquipment(prev => [...prev, eq]);
    const updateEquipment = (updatedEq: Equipment) => setEquipment(prev => prev.map(e => e.id === updatedEq.id ? updatedEq : e));

    const refreshAvailableTechnicians = async () => {
        try {
            const res = await client.get('/teams/technicians/available');
            const techData = res.data.map((t: any) => ({
                id: String(t.id),
                name: t.name,
                email: t.email,
                role: t.role
            }));
            setAvailableTechnicians(techData);
        } catch (e) {
            console.error("Failed to fetch available technicians", e);
        }
    };

    const addTechnicianToTeam = async (teamId: string, technicianId: string) => {
        try {
            const res = await client.post(`/teams/${teamId}/technicians`, {
                technician_id: Number(technicianId)
            });
            const addedTech = {
                id: String(res.data.id),
                name: res.data.name,
                email: res.data.email,
                role: res.data.role
            };

            // Update teams state
            setTeams(prev => prev.map(team => {
                if (team.id === teamId) {
                    return {
                        ...team,
                        technicianIds: [...team.technicianIds, addedTech.id],
                        technicians: [...(team.technicians || []), addedTech]
                    };
                }
                return team;
            }));

            // Remove from available technicians
            setAvailableTechnicians(prev => prev.filter(t => t.id !== technicianId));
        } catch (e) {
            console.error("Failed to add technician to team", e);
            throw e;
        }
    };

    const removeTechnicianFromTeam = async (teamId: string, technicianId: string) => {
        try {
            await client.delete(`/teams/${teamId}/technicians/${technicianId}`);

            // Find the removed technician's details before updating state
            const team = teams.find(t => t.id === teamId);
            const removedTech = team?.technicians?.find(t => t.id === technicianId);

            // Update teams state
            setTeams(prev => prev.map(t => {
                if (t.id === teamId) {
                    return {
                        ...t,
                        technicianIds: t.technicianIds.filter(id => id !== technicianId),
                        technicians: (t.technicians || []).filter(tech => tech.id !== technicianId)
                    };
                }
                return t;
            }));

            // Add back to available technicians
            if (removedTech) {
                setAvailableTechnicians(prev => [...prev, removedTech]);
            }
        } catch (e) {
            console.error("Failed to remove technician from team", e);
            throw e;
        }
    };

    return (
        <DataContext.Provider value={{
            currentUser,
            users,
            loading,
            error,
            teams,
            equipment,
            requests,
            availableTechnicians,
            updateRequestStatus,
            reassignTechnician,
            scrapEquipment,
            addRequest,
            createRequest,
            addUser: async () => { }, // Disabled
            updateUser: async (user: User) => {
                try {
                    await client.put(`/users/${user.id}`, user);
                    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
                } catch (e) {
                    console.error(e);
                }
            },
            addTeam: async (team: Team) => {
                try {
                    const res = await client.post('/teams', {
                        name: team.name,
                        manager_id: team.managerId ? Number(team.managerId) : undefined
                    });
                    const newTeam = res.data;
                    setTeams(prev => [...prev, { ...team, id: String(newTeam.id), managerName: team.managerName, technicians: [] }]);
                } catch (e) { console.error(e); }
            },
            updateTeam: async (team: Team) => {
                try {
                    await client.put(`/teams/${team.id}`, {
                        name: team.name,
                        manager_id: team.managerId ? Number(team.managerId) : null
                    });
                    setTeams(prev => prev.map(t => t.id === team.id ? team : t));
                } catch (e) { console.error(e); }
            },
            addEquipment,
            updateEquipment,
            assignEquipment: async (equipmentId: string, employeeId: string | null) => {
                try {
                    const res = await client.patch(`/equipment/${equipmentId}/assign`, {
                        employee_id: employeeId ? Number(employeeId) : null
                    });
                    const updated = res.data;
                    setEquipment(prev => prev.map(e => {
                        if (e.id === equipmentId) {
                            return {
                                ...e,
                                employeeId: employeeId || undefined,
                                employeeName: updated.employee ? updated.employee.name : undefined
                            };
                        }
                        return e;
                    }));
                } catch (e) {
                    console.error("Failed to assign equipment", e);
                }
            },
            addTechnicianToTeam,
            removeTechnicianFromTeam,
            refreshAvailableTechnicians
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

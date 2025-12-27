import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import client from '../api/client';
import type { User, Team, Equipment, MaintenanceRequest, RequestStatus } from '../types';
import { MOCK_REQUESTS, CURRENT_USER_ID } from '../data/mockData';

interface DataContextType {
    currentUser: User;
    users: User[];
    loading: boolean;
    error: string | null;
    teams: Team[];
    equipment: Equipment[];
    requests: MaintenanceRequest[];

    // Actions
    updateRequestStatus: (id: string, status: RequestStatus) => void;
    reassignTechnician: (requestId: string, technicianId: string) => void;
    scrapEquipment: (requestId: string, equipmentId: string) => void;
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [requests, setRequests] = useState<MaintenanceRequest[]>(MOCK_REQUESTS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, teamsRes, equipmentRes] = await Promise.all([
                    client.get('/users'),
                    client.get('/teams'),
                    client.get('/equipment')
                ]);

                const usersData = usersRes.data;
                const teamsData = teamsRes.data;
                const equipmentData = equipmentRes.data;

                // Map Backend User to Client User
                // Backend: { id: int, name, email, role: "ADMIN" }
                // Client: { id: string, name, role: "ADMIN", avatarUrl? }
                const mappedUsers = usersData.map((u: any) => ({
                    id: String(u.id),
                    name: u.name,
                    role: u.role,
                    email: u.email, // Add email to type if missing
                    avatarUrl: u.avatar_url
                }));

                const mappedTeams = teamsData.map((t: any) => ({
                    id: String(t.id),
                    name: t.name,
                    technicianIds: [] // Backend doesn't send members yet, might need separate logic
                }));

                const mappedEquipment = equipmentData.data.map((e: any) => ({
                    id: String(e.id),
                    name: e.name,
                    serialNumber: e.serial_number,
                    location: e.location,
                    teamId: String(e.maintenance_team_id),
                    defaultTechnicianId: e.default_technician_id ? String(e.default_technician_id) : undefined,
                    isActive: e.is_active,
                    status: e.is_active ? 'Operational' : 'Scrapped', // Default mapping
                    employeeId: e.employee_id ? String(e.employee_id) : undefined,
                    employeeName: e.employee ? e.employee.name : undefined
                }));

                setUsers(mappedUsers);
                setTeams(mappedTeams);
                setEquipment(mappedEquipment);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const currentUser = users.find(u => u.id === CURRENT_USER_ID) || users[0];

    const updateRequestStatus = (requestId: string, status: RequestStatus) => {
        setRequests(prev => prev.map(req =>
            req.id === requestId ? { ...req, status } : req
        ));
    };

    const reassignTechnician = (requestId: string, techId: string) => {
        setRequests(prev => prev.map(req =>
            req.id === requestId ? { ...req, assignedTechId: techId } : req
        ));
    };

    const scrapEquipment = (requestId: string, equipmentId: string) => {
        // 1. Update Request Status to 'Scrap'
        updateRequestStatus(requestId, 'Scrap');

        // 2. Update Equipment status and isActive
        setEquipment(prev => prev.map(eq =>
            eq.id === equipmentId
                ? { ...eq, isActive: false, status: 'Scrapped' }
                : eq
        ));

        setRequests(prev => prev.filter(req => {
            // Keep if it's NOT (the target equipment AND Preventive AND New)
            const isFuturePreventive = req.equipmentId === equipmentId &&
                req.type === 'Preventive' &&
                req.status === 'New';
            return !isFuturePreventive;
        }));
    };

    const addRequest = (request: MaintenanceRequest) => {
        setRequests(prev => [request, ...prev]);
    };

    const createRequest = (newRequest: any) => {
        const request: MaintenanceRequest = {
            id: String(requests.length + 1),
            createdAt: new Date().toISOString(),
            status: 'New',
            logs: [{
                timestamp: new Date().toISOString(),
                message: "Request created via System",
                actor: "System"
            }],
            ...newRequest
        };
        setRequests(prev => [request, ...prev]);
    };

    // CRUD Implementations
    // const addUser = (user: User) => setUsers(prev => [...prev, user]); // Removed to fix Duplicate/Unused error
    // const updateUser = (updatedUser: User) => setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    // const addTeam = (team: Team) => setTeams(prev => [...prev, team]);
    // const updateTeam = (updatedTeam: Team) => setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));

    const addEquipment = (eq: Equipment) => setEquipment(prev => [...prev, eq]);
    const updateEquipment = (updatedEq: Equipment) => setEquipment(prev => prev.map(e => e.id === updatedEq.id ? updatedEq : e));

    return (
        <DataContext.Provider value={{
            currentUser,
            users,
            loading,
            error,
            teams,
            equipment,
            requests,
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
                    const res = await client.post('/teams', { name: team.name });
                    const newTeam = res.data;
                    setTeams(prev => [...prev, { ...team, id: String(newTeam.id) }]);
                } catch (e) { console.error(e); }
            },
            updateTeam: async (team: Team) => {
                try {
                    await client.put(`/teams/${team.id}`, { name: team.name });
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
            }
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

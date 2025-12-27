import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, Team, Equipment, MaintenanceRequest, RequestStatus } from '../types';
import { MOCK_USERS, MOCK_TEAMS, MOCK_EQUIPMENT, MOCK_REQUESTS, CURRENT_USER_ID } from '../data/mockData';

interface DataContextType {
    currentUser: User;
    users: User[];
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
    const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
    const [requests, setRequests] = useState<MaintenanceRequest[]>(MOCK_REQUESTS);

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
    const addUser = (user: User) => setUsers(prev => [...prev, user]);
    const updateUser = (updatedUser: User) => setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    const addTeam = (team: Team) => setTeams(prev => [...prev, team]);
    const updateTeam = (updatedTeam: Team) => setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));

    const addEquipment = (eq: Equipment) => setEquipment(prev => [...prev, eq]);
    const updateEquipment = (updatedEq: Equipment) => setEquipment(prev => prev.map(e => e.id === updatedEq.id ? updatedEq : e));

    return (
        <DataContext.Provider value={{
            currentUser,
            users,
            teams,
            equipment,
            requests,
            updateRequestStatus,
            reassignTechnician,
            scrapEquipment,
            addRequest,
            createRequest,
            addUser,
            updateUser,
            addTeam,
            updateTeam,
            addEquipment,
            updateEquipment
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

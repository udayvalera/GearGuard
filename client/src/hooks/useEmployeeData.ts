import { useState, useEffect, useCallback } from 'react';
import type { MaintenanceRequest, Equipment } from '../types';
import { fetchRequests } from '../api/requests';
import { fetchEquipment } from '../api/equipment';

export const useEmployeeData = () => {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch requests (assuming backend filters by user context or we filter later)
            // Ideally, backend should have a "my requests" endpoint or filter
            const requestsData = await fetchRequests({ limit: 50 }); // Fetching recent requests
            setRequests(requestsData.data);

            // Fetch equipment
            const equipmentData = await fetchEquipment({ limit: 50 });
            setEquipment(equipmentData.data);
        } catch (err) {
            console.error("Failed to fetch employee data:", err);
            setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    return {
        requests,
        equipment,
        loading,
        error,
        refreshData
    };
};

export const useMyRequests = () => {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMyRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchRequests({ limit: 100 });
            // In a real scenario, we might pass a filter like { created_by: 'me' } if supported
            setRequests(data.data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyRequests();
    }, [fetchMyRequests]);

    return { requests, loading, refreshRequests: fetchMyRequests };
};

export const useMyEquipment = () => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMyEquipment = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchEquipment({ limit: 100 });
            setEquipment(data.data);
        } catch (error) {
            console.error("Failed to fetch equipment", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyEquipment();
    }, [fetchMyEquipment]);

    return { equipment, loading, refreshEquipment: fetchMyEquipment };
};

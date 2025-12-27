import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEmployeeData } from '../../hooks/useEmployeeData';
import { CreateRequestModal } from '../../components/modals/CreateRequestModal';
import { Button } from '../../components/design-system/Button';
import { KPICard } from '../../components/common/KPICard';
import { Card } from '../../components/design-system/Card';
import { formatDistanceToNow, parseISO } from 'date-fns';
// import { Activity, ShieldCheck, Clock } from 'lucide-react';
import { Activity, ShieldCheck, Clock, Plus } from 'lucide-react';

const EmployeeDashboard = () => {
    // const { requests, equipment } = useData();
    const { requests, equipment, loading, error } = useEmployeeData();
    const { user } = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // In a real app we'd filter by user.id, but for now filtering by 'CreatedBy' logic if available or just showing all for demo
    // Assuming 'requests' has a field to link to user or we just show all relative to the "Employee" view

    const kpis = useMemo(() => {
        // Mock filtering for "My Requests"
        const myRequests = requests;
        const open = myRequests.filter(r => r.status !== 'Repaired' && r.status !== 'Scrap').length;
        const completed = myRequests.filter(r => r.status === 'Repaired').length;
        // Mock "My Equipment" count
        const myEquipmentCount = equipment.length;

        return { open, completed, myEquipmentCount };
    }, [requests, equipment]);

    const recentActivity = useMemo(() => {
        const allLogs = requests.flatMap(r => r.logs.map(log => ({
            ...log,
            requestTitle: r.title
        })));

        return allLogs
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(5);
    }, [requests]);

    if (loading) return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">My Dashboard</h1>
                    <p className="text-[var(--color-text-secondary)]">Welcome back, {user?.name}</p>
                </div>
                <div className="flex gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm text-[var(--color-text-tertiary)]">
                            Last updated: {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus size={16} />}>
                        New Request
                    </Button>
                </div>
            </div>

            <CreateRequestModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="My Open Requests"
                    value={kpis.open}
                    icon={<Activity size={24} />}
                    variant="neutral"
                />
                <KPICard
                    title="Completed Requests"
                    value={kpis.completed}
                    icon={<Clock size={24} />}
                    variant="neutral"
                />
                <KPICard
                    title="My Equipment"
                    value={kpis.myEquipmentCount}
                    icon={<ShieldCheck size={24} />}
                    variant="neutral"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* My Requests List (Simplified) */}
                <Card className="lg:col-span-2">
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">My Active Requests</h2>
                    <div className="space-y-3">
                        {requests.filter(r => r.status !== 'Repaired' && r.status !== 'Scrap').slice(0, 5).map(req => (
                            <div key={req.id} className="p-3 border border-[var(--color-border-200)] rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-sm text-[var(--color-text-primary)]">{req.title}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{req.priority} • {formatDistanceToNow(parseISO(req.createdAt), { addSuffix: true })}</p>
                                </div>
                                <div className="px-2 py-1 bg-[var(--color-surface-100)] text-xs rounded font-medium text-[var(--color-text-secondary)]">
                                    {req.status}
                                </div>
                            </div>
                        ))}
                        {requests.filter(r => r.status !== 'Repaired' && r.status !== 'Scrap').length === 0 && (
                            <p className="text-sm text-[var(--color-text-tertiary)] py-4">No active requests.</p>
                        )}
                    </div>
                </Card>

                {/* Activity Feed */}
                <Card>
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Recent Updates</h2>
                    <div className="space-y-4">
                        {recentActivity.map((log: any, idx: number) => (
                            <div key={idx} className="flex gap-3 items-start">
                                <div className="mt-1 min-w-[32px] flex justify-center">
                                    <div className="w-2 h-2 rounded-full bg-[var(--color-brand-500)] mt-2"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1">
                                        {log.message}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        {log.requestTitle} • {formatDistanceToNow(parseISO(log.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentActivity.length === 0 && (
                            <p className="text-sm text-[var(--color-text-tertiary)] text-center py-4">No recent activity.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default EmployeeDashboard;

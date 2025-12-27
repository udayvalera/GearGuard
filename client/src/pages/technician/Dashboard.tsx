import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { KPICard } from '../../components/common/KPICard';
import { Card } from '../../components/design-system/Card';
import { KanbanCard } from '../../components/common/KanbanCard';
import { CheckCircle, Clock, Calendar as CalendarIcon } from 'lucide-react';

const TechnicianDashboard = () => {
    const { requests, equipment, users } = useData();
    const { user } = useAuth();

    const technicians = useMemo(() => users.filter(u => u.role === 'Technician'), [users]);

    // Mock filtering for "My Assigned Tasks"
    const myTasks = useMemo(() => {
        // In real app, filter by user.id aka assignedTechId
        return requests.filter(r => r.assignedTechId === user?.id || r.assignedTechId === undefined); // Showing unassigned too for demo
    }, [requests, user?.id]);

    const kpis = useMemo(() => {
        const assigned = myTasks.filter(r => r.status !== 'Repaired' && r.status !== 'Scrap').length;
        const completedToday = myTasks.filter(r => r.status === 'Repaired').length; // Mock, needs date check
        const upcoming = 2; // Mock preventive count

        return { assigned, completedToday, upcoming };
    }, [myTasks]);


    const handleReassign = (reqId: string, techId: string) => {
        console.log("Reassign", reqId, techId);
        // Implement reassign logic here (likely via context function)
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Technician Workspace</h1>
                    <p className="text-[var(--color-text-secondary)]">Ready to work, {user?.name}</p>
                </div>
                <div className="text-sm text-[var(--color-text-tertiary)]">
                    {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Assigned to Me"
                    value={kpis.assigned}
                    icon={<Clock size={24} />}
                    variant="neutral"
                />
                <KPICard
                    title="Completed Today"
                    value={kpis.completedToday}
                    icon={<CheckCircle size={24} />}
                    variant="neutral"
                />
                <KPICard
                    title="Upcoming Preventive"
                    value={kpis.upcoming}
                    icon={<CalendarIcon size={24} />}
                    variant="neutral"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Tasks Column */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)]">My Active Tasks</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myTasks.filter(r => r.status === 'New' || r.status === 'In Progress').map(req => (
                            <KanbanCard
                                key={req.id}
                                request={req}
                                equipment={equipment.find(e => e.id === req.equipmentId)}
                                technicians={technicians}
                                onReassign={handleReassign}
                            />
                        ))}
                        {myTasks.length === 0 && (
                            <Card className="col-span-2 p-8 text-center text-[var(--color-text-tertiary)]">
                                No tasks assigned. Nice work!
                            </Card>
                        )}
                    </div>
                </div>

                {/* Schedule / Calendar Sneak Peek */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Today's Schedule</h2>
                    <Card>
                        <div className="space-y-4">
                            <div className="flex gap-3 border-l-2 border-[var(--color-brand-500)] pl-3">
                                <div>
                                    <p className="text-xs font-bold text-[var(--color-brand-600)]">09:00 AM</p>
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">Daily Inspection - CNC 01</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">Routine Check</p>
                                </div>
                            </div>
                            <div className="flex gap-3 border-l-2 border-[var(--color-warning-500)] pl-3">
                                <div>
                                    <p className="text-xs font-bold text-[var(--color-warning-600)]">11:30 AM</p>
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">Filter Replacement</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">Hydraulic Press A</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TechnicianDashboard;

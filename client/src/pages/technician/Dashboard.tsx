import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { KPICard } from '../../components/common/KPICard';
import { Card } from '../../components/design-system/Card';
import { KanbanCard } from '../../components/common/KanbanCard';
import { CheckCircle, Clock, Calendar as CalendarIcon } from 'lucide-react';

const TechnicianDashboard = () => {
    const { requests, equipment, users, reassignTechnician, loading } = useData();
    const { user } = useAuth();

    const technicians = useMemo(() => users.filter(u => u.role === 'TECHNICIAN'), [users]);

    // Filter for "My Assigned Tasks"
    const myTasks = useMemo(() => {
        // Filter by assignedTechId
        if (!user) return [];
        return requests.filter(r => r.assignedTechId === user.id);
    }, [requests, user]);

    const kpis = useMemo(() => {
        const assigned = myTasks.filter(r => r.status !== 'Repaired' && r.status !== 'Scrap').length;

        // Count completed today
        const completedToday = myTasks.filter(r =>
            r.status === 'Repaired' &&
            // Check logs or closed_at if available in type? 
            // We mapped `dueDate` and `createdAt`. We might not have `closedAt` in MaintenanceRequest type yet.
            // Using a loose check if `r.status === 'Repaired'` and `r.updatedAt` is today? 
            // We don't have updatedAt. Let's use a simplified check or `dueDate` if it was today?
            // Actually, let's keep it simple: Filter 'Repaired' and if the count matches local state tracking or just total repaired assigned to me?
            // Better: just count 'Repaired' tasks assigned to me for now.
            r.status === 'Repaired'
        ).length;

        // Upcoming Preventive
        const upcoming = myTasks.filter(r =>
            r.type === 'Preventive' &&
            r.status === 'New'
        ).length;

        return { assigned, completedToday, upcoming };
    }, [myTasks]);


    const handleReassign = (reqId: string, techId: string) => {
        reassignTechnician(reqId, techId);
    };

    const todaysSchedule = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return myTasks.filter(r =>
            r.dueDate.startsWith(todayStr) &&
            r.status !== 'Repaired' &&
            r.status !== 'Scrap'
        ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [myTasks]);

    if (loading) return <div>Loading...</div>;

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
                    title="Completed"
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
                                No tasks assigned.
                            </Card>
                        )}
                    </div>
                </div>

                {/* Schedule / Calendar Sneak Peek */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Today's Schedule</h2>
                    <Card>
                        <div className="space-y-4">
                            {todaysSchedule.length > 0 ? (
                                todaysSchedule.map(task => (
                                    <div key={task.id} className="flex gap-3 border-l-2 border-[var(--color-brand-500)] pl-3">
                                        <div>
                                            <p className="text-xs font-bold text-[var(--color-brand-600)]">
                                                {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-sm font-medium text-[var(--color-text-primary)]">{task.title}</p>
                                            <p className="text-xs text-[var(--color-text-secondary)]">{task.type}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-[var(--color-text-secondary)]">No scheduled tasks for today.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TechnicianDashboard;

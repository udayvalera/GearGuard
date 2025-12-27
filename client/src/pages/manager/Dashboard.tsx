import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { AlertTriangle, Trash2, Activity } from 'lucide-react';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { KPICard } from '../../components/common/KPICard';
import { Card } from '../../components/design-system/Card';

const Dashboard = () => {
    const { requests, equipment, teams } = useData();

    // Derive technicians from teams data (managers have access to teams, not full users list)
    const technicians = useMemo(() => {
        const allTechs: { id: string; name: string }[] = [];
        teams.forEach(team => {
            if (team.technicians) {
                team.technicians.forEach(tech => {
                    if (!allTechs.find(t => t.id === tech.id)) {
                        allTechs.push({ id: tech.id, name: tech.name });
                    }
                });
            }
        });
        return allTechs;
    }, [teams]);

    // 1. KPI Calculations
    const kpis = useMemo(() => {
        const openRequests = requests.filter(r => r.status === 'New' || r.status === 'In Progress').length;

        const overdueRequests = requests.filter(r => {
            const isRepaired = r.status === 'Repaired' || r.status === 'Scrap';
            const isLate = isPast(parseISO(r.dueDate));
            return !isRepaired && isLate;
        }).length;

        const scrappedAssets = equipment.filter(e => !e.isActive).length;

        return { openRequests, overdueRequests, scrappedAssets };
    }, [requests, equipment]);

    // 2. Chart Data: Requests per Technician
    const chartData = useMemo(() => {
        const techMap = new Map<string, number>();

        technicians.forEach(tech => {
            techMap.set(tech.id, 0);
        });

        requests.forEach(r => {
            if ((r.status === 'New' || r.status === 'In Progress') && r.assignedTechId) {
                const current = techMap.get(r.assignedTechId) || 0;
                techMap.set(r.assignedTechId, current + 1);
            }
        });

        return Array.from(techMap.entries()).map(([techId, count]) => {
            const tech = technicians.find(t => t.id === techId);
            return {
                name: tech?.name.split(' ')[0] || 'Unknown',
                count,
                fill: count > 3 ? 'var(--color-error-600)' : 'var(--color-brand-500)'
            };
        });
    }, [requests, technicians]);

    // 3. Recent Activity Feed
    const activityFeed = useMemo(() => {
        const allLogs = requests.flatMap(r => r.logs.map(log => ({
            ...log,
            requestTitle: r.title,
            requestId: r.id
        })));

        return allLogs
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(5);
    }, [requests]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Overview</h1>
                    <p className="text-[var(--color-text-secondary)]">Welcome back, Manager.</p>
                </div>
                <div className="text-sm text-[var(--color-text-tertiary)]">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Open Requests"
                    value={kpis.openRequests}
                    icon={<Activity size={24} />}
                    variant="neutral"
                />
                <KPICard
                    title="Overdue Tasks"
                    value={kpis.overdueRequests}
                    icon={<AlertTriangle size={24} />}
                    variant={kpis.overdueRequests > 0 ? 'dangerous' : 'neutral'}
                />
                <KPICard
                    title="Scrapped Assets"
                    value={kpis.scrappedAssets}
                    icon={<Trash2 size={24} />}
                    variant="neutral"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <Card className="lg:col-span-2">
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Technician Workload</h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border-200)" />
                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fill: 'var(--color-text-primary)' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border-200)',
                                        boxShadow: 'var(--shadow-z2)',
                                        backgroundColor: 'var(--color-surface-0)'
                                    }}
                                    itemStyle={{ color: 'var(--color-text-primary)' }}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Activity Feed */}
                <Card>
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {activityFeed.map((log) => (
                            <div key={log.id} className="flex gap-3 items-start">
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
                        {activityFeed.length === 0 && (
                            <p className="text-sm text-[var(--color-text-tertiary)] text-center py-4">No recent activity.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;

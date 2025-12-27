import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { KPICard } from '../../components/common/KPICard';
import { Card } from '../../components/design-system/Card';
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
import { Users, Wrench, Settings, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
    const { users, equipment } = useData();
    const navigate = useNavigate();

    const kpis = useMemo(() => {
        const totalUsers = users.length;
        const totalEquipment = equipment.length;
        const totalTeams = 3; // Mock since we might not have teams data yet

        return { totalUsers, totalEquipment, totalTeams };
    }, [users, equipment]);

    const userDistribution = useMemo(() => {
        const dist = {
            Employee: 0,
            Technician: 0,
            Manager: 0,
            Admin: 0
        };

        users.forEach(u => {
            // @ts-ignore
            if (dist[u.role] !== undefined) {
                // @ts-ignore
                dist[u.role]++;
            }
        });

        return Object.entries(dist).map(([role, count]) => ({
            name: role,
            count,
            fill: 'var(--color-brand-500)'
        }));
    }, [users]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">System Administration</h1>
                    <p className="text-[var(--color-text-secondary)]">Overview of system status and resources.</p>
                </div>
                <div className="text-sm text-[var(--color-text-tertiary)]">
                    {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Total Users"
                    value={kpis.totalUsers}
                    icon={<Users size={24} />}
                    variant="neutral"
                />
                <KPICard
                    title="Total Equipment"
                    value={kpis.totalEquipment}
                    icon={<Wrench size={24} />}
                    variant="neutral"
                />
                <KPICard
                    title="Active Teams"
                    value={kpis.totalTeams}
                    icon={<ShieldCheck size={24} />}
                    variant="neutral"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Distribution Chart */}
                <Card>
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">User Distribution</h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-200)" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border-200)',
                                        boxShadow: 'var(--shadow-z2)',
                                        backgroundColor: 'var(--color-surface-0)'
                                    }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                                    {userDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* System Status / Quick Actions */}
                {/* System Status / Quick Actions */}
                <Card>
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/users')}
                            className="p-4 border border-[var(--color-border-200)] rounded-lg hover:bg-[var(--color-surface-50)] text-left transition-colors"
                        >
                            <Users className="mb-2 text-[var(--color-brand-600)]" />
                            <p className="font-medium text-sm">Manage Users</p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">Add, edit, or remove system users</p>
                        </button>
                        <button
                            onClick={() => navigate('/equipment')}
                            className="p-4 border border-[var(--color-border-200)] rounded-lg hover:bg-[var(--color-surface-50)] text-left transition-colors"
                        >
                            <Wrench className="mb-2 text-[var(--color-brand-600)]" />
                            <p className="font-medium text-sm">Manage Equipment</p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">Inventory tracking and status</p>
                        </button>
                        <button
                            onClick={() => navigate('/teams')}
                            className="p-4 border border-[var(--color-border-200)] rounded-lg hover:bg-[var(--color-surface-50)] text-left transition-colors"
                        >
                            <ShieldCheck className="mb-2 text-[var(--color-brand-600)]" />
                            <p className="font-medium text-sm">Manage Teams</p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">Assign technicians to teams</p>
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            className="p-4 border border-[var(--color-border-200)] rounded-lg hover:bg-[var(--color-surface-50)] text-left transition-colors"
                        >
                            <Settings className="mb-2 text-[var(--color-brand-600)]" />
                            <p className="font-medium text-sm">System Settings</p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">Configure global parameters</p>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;

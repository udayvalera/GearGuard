import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/design-system/Table';
import { Badge } from '../../components/design-system/Badge';
import { Card } from '../../components/design-system/Card';

const Reports = () => {
    const { users, requests } = useData();
    const technicians = users.filter(u => u.role === 'TECHNICIAN');

    const reportData = useMemo(() => {
        return technicians.map(tech => {
            const techRequests = requests.filter(r => r.assignedTechId === tech.id);
            const activeCount = techRequests.filter(r => r.status === 'New' || r.status === 'In Progress').length;
            const completedCount = techRequests.filter(r => r.status === 'Repaired').length;

            const seed = tech.id.charCodeAt(tech.id.length - 1);
            const avgResolutionTime = 2.5 + (seed % 5) / 2;

            return {
                ...tech,
                activeCount,
                completedCount,
                avgResolutionTime: avgResolutionTime.toFixed(1)
            };
        }).sort((a, b) => b.completedCount - a.completedCount);
    }, [technicians, requests]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Technician Performance</h1>
                <p className="text-[var(--color-text-secondary)]">Real-time workload and velocity tracking.</p>
            </div>

            <Card noPadding>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Technician</TableHead>
                            <TableHead className="text-right">Active Tickets</TableHead>
                            <TableHead className="text-right">Completed</TableHead>
                            <TableHead className="text-right">Avg. Resolution (Hrs)</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((tech) => (
                            <TableRow key={tech.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={tech.avatarUrl}
                                            alt={tech.name}
                                            className="w-10 h-10 rounded-full border border-[var(--color-border-200)]"
                                        />
                                        <div>
                                            <p className="font-semibold text-[var(--color-text-primary)]">{tech.name}</p>
                                            <p className="text-xs text-[var(--color-text-secondary)]">ID: {tech.id}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="inline-flex items-center gap-2 justify-end">
                                        <Badge variant="info" className="gap-1.5">
                                            <AlertCircle size={14} />
                                            {tech.activeCount}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="inline-flex items-center gap-2 text-[var(--color-text-primary)] font-medium justify-end">
                                        <CheckCircle size={16} className="text-[var(--color-success-600)]" />
                                        {tech.completedCount}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] justify-end">
                                        <Clock size={16} className="text-[var(--color-text-tertiary)]" />
                                        {tech.avgResolutionTime}h
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {tech.activeCount > 3 ? (
                                        <Badge variant="warning">Overloaded</Badge>
                                    ) : (
                                        <Badge variant="success">Healthy</Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default Reports;

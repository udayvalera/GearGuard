// import { useMemo } from 'react';
// import { useData } from '../../context/DataContext';
import { useMyRequests, useMyEquipment } from '../../hooks/useEmployeeData';
import { Card } from '../../components/design-system/Card';
import { Badge } from '../../components/design-system/Badge';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const MyRequests = () => {
    // const { requests, equipment } = useData();
    const { requests: myRequests, loading } = useMyRequests();
    const { equipment } = useMyEquipment(); // Needed for equipment name lookup

    if (loading) return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading requests...</div>;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'New': return <Clock size={16} />;
            case 'Repaired': return <CheckCircle size={16} />;
            default: return <AlertTriangle size={16} />;
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'New': return 'warning';
            case 'In Progress': return 'neutral';
            case 'Repaired': return 'success';
            case 'Scrap': return 'error';
            default: return 'neutral';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">My Requests</h1>
                    <p className="text-[var(--color-text-secondary)]">Track the status of your maintenance tickets.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {myRequests.map(req => {
                    const equip = equipment.find(e => e.id === req.equipmentId);
                    return (
                        <Card key={req.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex gap-4 items-center">
                                <div className={`p-3 rounded-full bg-[var(--color-surface-100)]`}>
                                    {getStatusIcon(req.status)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--color-text-primary)]">{req.title}</h3>
                                    <p className="text-sm text-[var(--color-text-tertiary)] flex items-center gap-2">
                                        <span>{equip?.name || 'Unknown Equipment'}</span>
                                        <span>•</span>
                                        <span>{formatDistanceToNow(parseISO(req.createdAt), { addSuffix: true })}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 self-end md:self-auto">
                                <Badge variant={req.priority === 'High' ? 'error' : req.priority === 'Medium' ? 'warning' : 'success'}>
                                    {req.priority}
                                </Badge>
                                <Badge variant={getStatusVariant(req.status) as any}>
                                    {req.status}
                                </Badge>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default MyRequests;

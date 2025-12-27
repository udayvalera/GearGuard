import { useMyEquipment } from '../../hooks/useEmployeeData';
import { Card } from '../../components/design-system/Card';
import { Badge } from '../../components/design-system/Badge';
import { Power, MapPin, Calendar } from 'lucide-react';

const MyEquipment = () => {
    // const { equipment } = useData();
    const { equipment: myEquipment, loading } = useMyEquipment();

    if (loading) return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading equipment...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">My Equipment</h1>
                    <p className="text-[var(--color-text-secondary)]">Manage and monitor your assigned machinery.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEquipment.map(item => (
                    <Card key={item.id} className="hover:shadow-[var(--shadow-z2)] transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-[var(--color-brand-50)] rounded-lg text-[var(--color-brand-600)]">
                                <Power size={24} />
                            </div>
                            <Badge variant={item.status === 'Operational' ? 'success' : 'error'}>
                                {item.status}
                            </Badge>
                        </div>

                        <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-1">{item.name}</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-4">{item.serialNumber}</p>

                        <div className="space-y-2 border-t border-[var(--color-border-200)] pt-4">
                            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                <MapPin size={16} />
                                <span>{item.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                <Calendar size={16} />
                                <span>Installation: 2023</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MyEquipment;

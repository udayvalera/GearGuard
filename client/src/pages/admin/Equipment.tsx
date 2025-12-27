import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/design-system/Card';
import { Badge } from '../../components/design-system/Badge';
import { Button } from '../../components/design-system/Button';
import { Plus, Wrench } from 'lucide-react';
import { EquipmentModal } from '../../components/modals/EquipmentModal';
import type { Equipment } from '../../types';

const EquipmentPage = () => {
    const { equipment } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

    const handleEdit = (eq: Equipment) => {
        setSelectedEquipment(eq);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedEquipment(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Equipment Inventory</h1>
                    <p className="text-[var(--color-text-secondary)]">Manage all machinery and assets.</p>
                </div>
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleAdd}>
                    Add Equipment
                </Button>
            </div>

            <Card className="overflow-hidden p-0">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--color-surface-50)] text-[var(--color-text-secondary)] text-sm font-semibold border-b border-[var(--color-border-200)]">
                        <tr>
                            <th className="p-4">Equipment Name</th>
                            <th className="p-4">Model / Serial</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-200)]">
                        {equipment.map(item => (
                            <tr key={item.id} className="hover:bg-[var(--color-surface-50)] transition-colors">
                                <td className="p-4 font-medium text-[var(--color-text-primary)]">
                                    <div className="flex items-center gap-3">
                                        <Wrench size={16} className="text-[var(--color-text-tertiary)]" />
                                        {item.name}
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-[var(--color-text-secondary)]">
                                    {item.model} <br /> <span className="text-[10px] uppercase font-mono">{item.serialNumber}</span>
                                </td>
                                <td className="p-4 text-sm text-[var(--color-text-secondary)]">
                                    {item.location}
                                </td>
                                <td className="p-4">
                                    <Badge variant={item.status === 'Active' ? 'success' : 'error'}>
                                        {item.status}
                                    </Badge>
                                </td>
                                <td className="p-4 text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <EquipmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                equipment={selectedEquipment}
            />
        </div>
    );
};

export default EquipmentPage;

import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Button } from '../design-system/Button';
import { Input } from '../design-system/Input';
import { X } from 'lucide-react';
import type { Equipment, EquipmentStatus } from '../../types';

interface EquipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    equipment?: Equipment | null;
}

export const EquipmentModal = ({ isOpen, onClose, equipment }: EquipmentModalProps) => {
    const { addEquipment, updateEquipment } = useData();
    const [name, setName] = useState('');
    const [model, setModel] = useState('');
    const [serial, setSerial] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState<EquipmentStatus>('Operational');

    useEffect(() => {
        if (equipment) {
            setName(equipment.name);
            setModel((equipment as any).model || '');
            setSerial(equipment.serialNumber);
            setLocation(equipment.location);
            setStatus(equipment.status);
        } else {
            setName('');
            setModel('');
            setSerial('');
            setLocation('');
            setStatus('Operational');
        }
    }, [equipment, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (equipment) {
            updateEquipment({
                ...equipment,
                name,
                serialNumber: serial,
                location,
                status,
                // Add model if expanded
            });
        } else {
            addEquipment({
                id: `eq-${Date.now()}`,
                name,
                serialNumber: serial,
                location,
                status,
                isActive: status !== 'Scrapped',
                teamId: '1' // Default
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[var(--color-surface-0)] rounded-[var(--radius-xl)] shadow-[var(--shadow-z3)] w-full max-w-[500px] p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                        {equipment ? 'Edit Equipment' : 'Add New Equipment'}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={onClose}><X size={20} /></Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Equipment Name"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Industrial Conveyor Belt"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Model"
                            value={model}
                            onChange={e => setModel(e.target.value)}
                            placeholder="e.g. X-2000"
                        />
                        <Input
                            label="Serial Number"
                            required
                            value={serial}
                            onChange={e => setSerial(e.target.value)}
                            placeholder="SN-123456"
                        />
                    </div>

                    <Input
                        label="Location"
                        required
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. Zone B - Floor 2"
                    />

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)]">Status</label>
                        <select
                            className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border-200)] bg-[var(--color-surface-0)] text-sm focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
                            value={status}
                            onChange={e => setStatus(e.target.value as EquipmentStatus)}
                        >
                            <option value="Operational">Operational</option>
                            <option value="Under Maintenance">Under Maintenance</option>
                            <option value="Scrapped">Scrapped</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-200)]">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {equipment ? 'Save Changes' : 'Add Equipment'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

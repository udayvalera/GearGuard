import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Button } from '../design-system/Button';
import { X, AlertCircle } from 'lucide-react';

interface CreateRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateRequestModal = ({ isOpen, onClose }: CreateRequestModalProps) => {
    const { equipment, createRequest, currentUser } = useData();
    const [title, setTitle] = useState('');
    const [equipmentId, setEquipmentId] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Mock create logic using context
        createRequest({
            title,
            description,
            priority,
            equipmentId,
            status: 'New',
            type: 'Corrective', // Default
            createdBy: currentUser.id
        });

        onClose();
        // Reset form
        setTitle('');
        setEquipmentId('');
        setDescription('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[var(--color-surface-0)] rounded-[var(--radius-xl)] shadow-[var(--shadow-z3)] w-full max-w-[500px] p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">New Maintenance Request</h2>
                    <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] p-1 rounded-full hover:bg-[var(--color-surface-100)]">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Issue Title</label>
                        <input
                            type="text"
                            required
                            className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border-200)] focus:ring-2 focus:ring-[var(--color-brand-100)] focus:border-[var(--color-brand-500)] outline-none transition-all"
                            placeholder="e.g. Pump Leaking"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Affected Equipment</label>
                        <select
                            required
                            className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border-200)] focus:ring-2 focus:ring-[var(--color-brand-100)] focus:border-[var(--color-brand-500)] outline-none transition-all bg-white"
                            value={equipmentId}
                            onChange={e => setEquipmentId(e.target.value)}
                        >
                            <option value="">Select Equipment...</option>
                            {equipment.map(e => (
                                <option key={e.id} value={e.id}>{e.name} ({e.serialNumber})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Priority</label>
                        <div className="flex gap-2">
                            {['Low', 'Medium', 'High'].map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-[var(--radius-md)] border transition-all ${priority === p
                                        ? 'bg-[var(--color-brand-50)] border-[var(--color-brand-200)] text-[var(--color-brand-700)]'
                                        : 'bg-white border-[var(--color-border-200)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-50)]'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Description</label>
                        <textarea
                            rows={3}
                            className="w-full p-3 rounded-[var(--radius-md)] border border-[var(--color-border-200)] focus:ring-2 focus:ring-[var(--color-brand-100)] focus:border-[var(--color-brand-500)] outline-none transition-all"
                            placeholder="Describe the problem details..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Create Ticket
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

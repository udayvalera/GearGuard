import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Button } from '../design-system/Button';
import { Input } from '../design-system/Input';
import { X } from 'lucide-react';
import type { Team } from '../../types';

interface TeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    team?: Team | null;
}

export const TeamModal = ({ isOpen, onClose, team }: TeamModalProps) => {
    const { addTeam, updateTeam, users } = useData();
    const [name, setName] = useState('');
    const [managerId, setManagerId] = useState('');

    const managers = users.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN');

    useEffect(() => {
        if (team) {
            setName(team.name);
            setManagerId(team.managerId || '');
        } else {
            setName('');
            setManagerId('');
        }
    }, [team, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const selectedManager = managers.find(m => m.id === managerId);
        const managerName = selectedManager?.name;

        if (team) {
            updateTeam({
                ...team,
                name,
                managerId,
                managerName
            });
        } else {
            addTeam({
                id: `t-${Date.now()}`,
                name,
                technicianIds: [],
                managerId,
                managerName
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[var(--color-surface-0)] rounded-[var(--radius-xl)] shadow-[var(--shadow-z3)] w-full max-w-[500px] p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                        {team ? 'Edit Team' : 'Create New Team'}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={onClose}><X size={20} /></Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Team Name"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Electrical Maintenance"
                    />

                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)]">Team Manager</label>
                        <select
                            className="flex h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border-200)] bg-[var(--color-surface-0)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]"
                            value={managerId}
                            onChange={e => setManagerId(e.target.value)}
                        >
                            <option value="">Select Manager</option>
                            {managers.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-200)]">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {team ? 'Save Changes' : 'Create Team'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

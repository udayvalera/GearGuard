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
    const { addTeam, updateTeam } = useData();
    const [name, setName] = useState('');
    const [lead, setLead] = useState(''); // Mock field for now

    useEffect(() => {
        if (team) {
            setName(team.name);
            setLead((team as any).lead || 'John Doe'); // Mock
        } else {
            setName('');
            setLead('');
        }
    }, [team, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (team) {
            updateTeam({
                ...team,
                name,
                // Add lead logic here if expanded
            });
        } else {
            addTeam({
                id: `t-${Date.now()}`,
                name,
                technicianIds: [] // Empty start
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

                    <Input
                        label="Team Lead (Optional)"
                        value={lead}
                        onChange={e => setLead(e.target.value)}
                        placeholder="e.g. Senior Technician"
                    />

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

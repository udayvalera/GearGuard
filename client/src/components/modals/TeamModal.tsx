import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Button } from '../design-system/Button';
import { Input } from '../design-system/Input';
import { X, UserPlus, UserMinus, Users } from 'lucide-react';
import type { Team, TeamMember } from '../../types';

interface TeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    team?: Team | null;
}

export const TeamModal = ({ isOpen, onClose, team }: TeamModalProps) => {
    const { addTeam, updateTeam, users, availableTechnicians, addTechnicianToTeam, removeTechnicianFromTeam, refreshAvailableTechnicians } = useData();
    const [name, setName] = useState('');
    const [managerId, setManagerId] = useState('');
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
    const [isAddingTechnician, setIsAddingTechnician] = useState(false);
    const [removingTechnicianId, setRemovingTechnicianId] = useState<string | null>(null);

    const managers = users.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN');

    useEffect(() => {
        if (isOpen) {
            refreshAvailableTechnicians();
        }
    }, [isOpen]);

    useEffect(() => {
        if (team) {
            setName(team.name);
            setManagerId(team.managerId || '');
        } else {
            setName('');
            setManagerId('');
        }
        setSelectedTechnicianId('');
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
                technicians: [],
                managerId,
                managerName
            });
        }
        onClose();
    };

    const handleAddTechnician = async () => {
        if (!team || !selectedTechnicianId) return;
        
        setIsAddingTechnician(true);
        try {
            await addTechnicianToTeam(team.id, selectedTechnicianId);
            setSelectedTechnicianId('');
        } catch (error) {
            console.error('Failed to add technician:', error);
        } finally {
            setIsAddingTechnician(false);
        }
    };

    const handleRemoveTechnician = async (technicianId: string) => {
        if (!team) return;
        
        setRemovingTechnicianId(technicianId);
        try {
            await removeTechnicianFromTeam(team.id, technicianId);
        } catch (error) {
            console.error('Failed to remove technician:', error);
        } finally {
            setRemovingTechnicianId(null);
        }
    };

    // Get current team's technicians from the teams data
    const currentTeamTechnicians = team?.technicians || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[var(--color-surface-0)] rounded-[var(--radius-xl)] shadow-[var(--shadow-z3)] w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95 duration-200">
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

                    {/* Technician Assignment Section - Only show for existing teams */}
                    {team && (
                        <div className="border-t border-[var(--color-border-200)] pt-4 mt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Users size={18} className="text-[var(--color-brand-600)]" />
                                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                                    Team Technicians ({currentTeamTechnicians.length})
                                </h3>
                            </div>

                            {/* Add Technician */}
                            <div className="flex gap-2 mb-4">
                                <select
                                    className="flex-1 h-10 rounded-[var(--radius-md)] border border-[var(--color-border-200)] bg-[var(--color-surface-0)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]"
                                    value={selectedTechnicianId}
                                    onChange={e => setSelectedTechnicianId(e.target.value)}
                                    disabled={isAddingTechnician}
                                >
                                    <option value="">Select technician to add...</option>
                                    {availableTechnicians.map(tech => (
                                        <option key={tech.id} value={tech.id}>
                                            {tech.name} ({tech.email})
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleAddTechnician}
                                    disabled={!selectedTechnicianId || isAddingTechnician}
                                    leftIcon={<UserPlus size={16} />}
                                >
                                    {isAddingTechnician ? 'Adding...' : 'Add'}
                                </Button>
                            </div>

                            {/* Current Technicians List */}
                            {currentTeamTechnicians.length > 0 ? (
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {currentTeamTechnicians.map(tech => (
                                        <div
                                            key={tech.id}
                                            className="flex items-center justify-between p-3 bg-[var(--color-surface-50)] rounded-[var(--radius-md)] border border-[var(--color-border-100)]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[var(--color-brand-100)] flex items-center justify-center text-[var(--color-brand-700)] font-medium text-sm">
                                                    {tech.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{tech.name}</p>
                                                    <p className="text-xs text-[var(--color-text-tertiary)]">{tech.email}</p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveTechnician(tech.id)}
                                                disabled={removingTechnicianId === tech.id}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                {removingTechnicianId === tech.id ? (
                                                    <span className="text-xs">Removing...</span>
                                                ) : (
                                                    <UserMinus size={16} />
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-sm text-[var(--color-text-tertiary)] bg-[var(--color-surface-50)] rounded-[var(--radius-md)]">
                                    No technicians assigned to this team yet.
                                </div>
                            )}

                            {availableTechnicians.length === 0 && currentTeamTechnicians.length === 0 && (
                                <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
                                    No technicians available. Make sure users have the TECHNICIAN role assigned.
                                </p>
                            )}
                        </div>
                    )}

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

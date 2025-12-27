import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/design-system/Card';
import { Button } from '../../components/design-system/Button';
import { Plus, Users, ShieldCheck, Wrench } from 'lucide-react';
import { TeamModal } from '../../components/modals/TeamModal';
import type { Team } from '../../types';

const TeamsPage = () => {
    const { teams } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    const handleEdit = (team: Team) => {
        setSelectedTeam(team);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedTeam(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Maintenance Teams</h1>
                    <p className="text-[var(--color-text-secondary)]">Organize technicians into specialized groups.</p>
                </div>
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleAdd}>
                    Create Team
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map(team => {
                    const technicianCount = team.technicians?.length || team.technicianIds?.length || 0;
                    
                    return (
                        <Card
                            key={team.id}
                            className="group hover:border-[var(--color-brand-300)] transition-colors cursor-pointer"
                            onClick={() => handleEdit(team)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-[var(--color-brand-50)] rounded-xl text-[var(--color-brand-600)]">
                                    <Users size={24} />
                                </div>
                                <ShieldCheck className="text-[var(--color-text-tertiary)]" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">{team.name}</h3>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                                Manager: {team.managerName || 'Unassigned'}
                            </p>

                            <div className="flex items-center justify-between text-sm text-[var(--color-text-tertiary)] border-t border-[var(--color-border-200)] pt-4">
                                <div className="flex items-center gap-2">
                                    <Wrench size={14} className="text-[var(--color-brand-500)]" />
                                    <span className="font-medium text-[var(--color-text-primary)]">{technicianCount}</span>
                                    <span>Technician{technicianCount !== 1 ? 's' : ''}</span>
                                </div>
                                <span className="text-xs text-[var(--color-brand-500)] opacity-0 group-hover:opacity-100 transition-opacity">
                                    Click to manage →
                                </span>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <TeamModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                team={selectedTeam}
            />
        </div>
    );
};

export default TeamsPage;

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { MaintenanceRequest, User, Equipment } from '../../types';
import { Clock, AlertCircle, Calendar, User as UserIcon } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { Card } from '../design-system/Card';
import { Badge } from '../design-system/Badge';

interface KanbanCardProps {
    request: MaintenanceRequest;
    equipment?: Equipment;
    technicians: User[];
    onReassign: (reqId: string, teaId: string) => void;
    isOverlay?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
    request,
    equipment,
    technicians,
    onReassign,
    isOverlay
}) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: request.id,
        data: { ...request },
        disabled: request.status === 'Scrap'
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    const isLate = isPast(parseISO(request.dueDate)) && request.status !== 'Repaired' && request.status !== 'Scrap';

    const getPriorityVariant = (priority: string) => {
        switch (priority) {
            case 'High': return 'error';
            case 'Medium': return 'warning';
            case 'Low': return 'success';
            default: return 'neutral';
        }
    };

    const handleTechChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        onReassign(request.id, e.target.value);
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="outline-none">
            <Card
                className={`
                    group relative transition-shadow duration-200
                    ${isOverlay ? 'rotate-2 shadow-xl cursor-grabbing' : 'hover:shadow-[var(--shadow-z2)] cursor-grab'}
                    ${request.status === 'Scrap' ? 'opacity-75 bg-slate-50' : 'bg-white'}
                `}
            >
                <div className="flex justify-between items-start mb-2">
                    <Badge variant={getPriorityVariant(request.priority) as any}>
                        {request.priority}
                    </Badge>
                    {isLate && (
                        <Badge variant="error" className="gap-1">
                            <Clock size={12} /> LATE
                        </Badge>
                    )}
                </div>

                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1 leading-tight">
                    {request.title}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-3 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {equipment?.name || 'Unknown Equipment'}
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border-200)]">
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                        <Calendar size={12} />
                        {format(parseISO(request.dueDate), 'MMM d')}
                    </div>

                    <div className="relative" onPointerDown={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 bg-[var(--color-surface-50)] border border-[var(--color-border-200)] rounded px-1.5 py-1">
                            <UserIcon size={12} className="text-[var(--color-text-tertiary)]" />
                            <select
                                className="bg-transparent text-xs text-[var(--color-text-primary)] outline-none w-24 cursor-pointer"
                                value={request.assignedTechId || ''}
                                onChange={handleTechChange}
                            >
                                <option value="" disabled>Unassigned</option>
                                {technicians.map(tech => (
                                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    type DragEndEvent,
    type DragStartEvent,
    useDroppable
} from '@dnd-kit/core';
import { useData } from '../../context/DataContext';
import type { RequestStatus } from '../../types';
import { KanbanCard } from '../../components/manager/KanbanCard';
import { AlertOctagon } from 'lucide-react';
import { Badge } from '../../components/design-system/Badge';
import { Button } from '../../components/design-system/Button';
import { clsx } from 'clsx';

const COLUMNS: { id: RequestStatus; title: string; color: string }[] = [
    { id: 'New', title: 'New Requests', color: 'border-blue-500' },
    { id: 'In Progress', title: 'In Progress', color: 'border-orange-500' },
    { id: 'Repaired', title: 'Repaired', color: 'border-emerald-500' },
    { id: 'Scrap', title: 'Scrap Candidate', color: 'border-red-600' },
];

const KanbanColumn = ({ id, title, color, children, isOver }: any) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                "flex-1 min-w-[280px] bg-[var(--color-surface-50)] rounded-[var(--radius-lg)] p-4 flex flex-col gap-4 border-t-4 transition-colors",
                color,
                isOver && "bg-[var(--color-surface-100)] ring-2 ring-[var(--color-brand-200)]"
            )}
        >
            <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center justify-between">
                {title}
                <Badge variant="neutral">{React.Children.count(children)}</Badge>
            </h3>
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-220px)] p-1">
                {children}
            </div>
        </div>
    );
};

const ScrapModal = ({ isOpen, onClose, onConfirm, equipmentName }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[var(--color-surface-0)] rounded-[var(--radius-xl)] shadow-[var(--shadow-z3)] max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-[var(--color-error-600)] mb-4">
                    <div className="p-2 bg-red-50 rounded-full">
                        <AlertOctagon size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Confirm Asset Scrap?</h2>
                </div>
                <p className="text-[var(--color-text-secondary)] mb-6">
                    You are about to scrap <strong className="text-[var(--color-text-primary)]">{equipmentName}</strong>.
                    This is an irreversible action that will:
                </p>
                <ul className="list-disc list-inside text-sm text-[var(--color-text-secondary)] mb-6 space-y-2 bg-[var(--color-surface-50)] p-4 rounded-[var(--radius-md)] border border-[var(--color-border-200)]">
                    <li>Mark the equipment as <strong>Inactive</strong>.</li>
                    <li>Cancel all future <strong>Preventive Maintenance</strong>.</li>
                    <li>Log a permanent record of this disposal.</li>
                </ul>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={onConfirm} className="shadow-red-200">
                        Confirm Scrap
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default function Kanban() {
    const { requests, equipment, users, updateRequestStatus, reassignTechnician, scrapEquipment } = useData();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [scrapModal, setScrapModal] = useState<{ isOpen: boolean; requestId: string; equipmentId: string; equipmentName: string } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const requestId = active.id as string;
        const newStatus = over.id as RequestStatus;
        const request = requests.find(r => r.id === requestId);

        if (!request || request.status === newStatus) return;

        // SCENARIO: Moving to Scrap
        if (newStatus === 'Scrap') {
            const equip = equipment.find(e => e.id === request.equipmentId);
            setScrapModal({
                isOpen: true,
                requestId,
                equipmentId: request.equipmentId,
                equipmentName: equip?.name || 'Unknown Item'
            });
            return;
        }

        // Normal Status Update
        updateRequestStatus(requestId, newStatus);
    };

    const handleScrapConfirm = () => {
        if (scrapModal) {
            scrapEquipment(scrapModal.requestId, scrapModal.equipmentId);
            setScrapModal(null);
        }
    };

    const activeRequest = activeId ? requests.find(r => r.id === activeId) : null;
    const activeEquipment = activeRequest ? equipment.find(e => e.id === activeRequest.equipmentId) : undefined;
    const technicians = users.filter(u => u.role === 'Technician');

    return (
        <>
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Maintenance Board</h1>
                    <div className="flex gap-2">
                        <Badge variant="neutral">
                            {requests.length} Total Tickets
                        </Badge>
                    </div>
                </div>

                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-6 overflow-x-auto pb-4 h-full items-stretch">
                        {COLUMNS.map(col => (
                            <KanbanColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                color={col.color}
                            >
                                {requests
                                    .filter(r => r.status === col.id)
                                    .map(req => (
                                        <KanbanCard
                                            key={req.id}
                                            request={req}
                                            equipment={equipment.find(e => e.id === req.equipmentId)}
                                            technicians={technicians}
                                            onReassign={reassignTechnician}
                                        />
                                    ))}
                            </KanbanColumn>
                        ))}
                    </div>

                    <DragOverlay>
                        {activeId && activeRequest ? (
                            <KanbanCard
                                request={activeRequest}
                                equipment={activeEquipment}
                                technicians={technicians}
                                onReassign={() => { }}
                                isOverlay
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            <ScrapModal
                isOpen={!!scrapModal}
                equipmentName={scrapModal?.equipmentName}
                onClose={() => setScrapModal(null)}
                onConfirm={handleScrapConfirm}
            />
        </>
    );
}

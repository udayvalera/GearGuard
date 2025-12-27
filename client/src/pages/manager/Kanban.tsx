import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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

const ScrapModal = ({ isOpen, onClose, onConfirm, equipmentName, error, isLoading }: any) => {
    if (!isOpen) return null;
    
    return createPortal(
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            style={{ isolation: 'isolate' }}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-6"
                style={{ width: '100%', maxWidth: '28rem', minWidth: '320px' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 text-red-600 mb-4">
                    <div className="p-2 bg-red-50 rounded-full shrink-0">
                        <AlertOctagon size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Confirm Asset Scrap?</h2>
                </div>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}
                
                <p className="text-gray-600 mb-6">
                    You are about to scrap <strong className="text-gray-900">{equipmentName}</strong>. This is an irreversible action that will:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <li>Mark the equipment as <strong>Inactive</strong>.</li>
                    <li>Cancel all future <strong>Preventive Maintenance</strong>.</li>
                    <li>Log a permanent record of this disposal.</li>
                </ul>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Confirm Scrap'}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default function Kanban() {
    const { requests, equipment, users, teams, updateRequestStatus, reassignTechnician, scrapEquipment } = useData();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [scrapModal, setScrapModal] = useState<{ isOpen: boolean; requestId: string; equipmentId: string; equipmentName: string } | null>(null);
    const [scrapError, setScrapError] = useState<string | null>(null);
    const [scrapLoading, setScrapLoading] = useState(false);

    // Helper to get technicians for a specific request based on request's team
    const getTechniciansForRequest = (req: typeof requests[0]) => {
        // Use request's teamId directly (this matches backend validation)
        const team = teams.find(t => t.id === req.teamId);
        if (team?.technicians && team.technicians.length > 0) {
            return team.technicians;
        }
        // Fallback: return empty array if no team found (prevent invalid assignments)
        return [];
    };

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
            // Use equipmentName from request (from backend), or fallback to equipment lookup
            const equipName = request.equipmentName || equip?.name || 'Unknown Item';
            setScrapModal({
                isOpen: true,
                requestId,
                equipmentId: request.equipmentId,
                equipmentName: equipName
            });
            return;
        }

        // Normal Status Update
        updateRequestStatus(requestId, newStatus);
    };

    const handleScrapConfirm = async () => {
        if (scrapModal) {
            setScrapLoading(true);
            setScrapError(null);
            
            const result = await scrapEquipment(scrapModal.requestId, scrapModal.equipmentId);
            
            setScrapLoading(false);
            
            if (result.success) {
                setScrapModal(null);
                setScrapError(null);
            } else {
                setScrapError(result.error || 'Failed to scrap equipment');
            }
        }
    };
    
    const handleScrapClose = () => {
        setScrapModal(null);
        setScrapError(null);
    };

    const activeRequest = activeId ? requests.find(r => r.id === activeId) : null;
    const activeEquipment = activeRequest ? equipment.find(e => e.id === activeRequest.equipmentId) : undefined;
    const activeTechnicians = activeRequest ? getTechniciansForRequest(activeRequest) : [];

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
                                            technicians={getTechniciansForRequest(req)}
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
                                technicians={activeTechnicians}
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
                onClose={handleScrapClose}
                onConfirm={handleScrapConfirm}
                error={scrapError}
                isLoading={scrapLoading}
            />
        </>
    );
}

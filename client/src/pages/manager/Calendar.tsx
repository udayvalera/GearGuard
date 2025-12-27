import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, X } from 'lucide-react';
import { Button } from '../../components/design-system/Button';
import { Input } from '../../components/design-system/Input';
import { Card } from '../../components/design-system/Card';
import { Badge } from '../../components/design-system/Badge';
import { clsx } from 'clsx';

const ScheduleModal = ({ isOpen, onClose, date, onSchedule }: any) => {
    const { equipment, users } = useData();
    const activeEquipment = equipment.filter(e => e.isActive);
    const technicians = users.filter(u => u.role === 'Technician');

    const [formData, setFormData] = useState({
        equipmentId: '',
        techId: '',
        title: 'Monthly Preventative Check',
        description: 'Routine maintenance check logic.',
        priority: 'Medium'
    });

    if (!isOpen || !date) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSchedule({
            ...formData,
            dueDate: date.toISOString(),
            type: 'Preventive',
            status: 'New'
        });
        onClose();
        setFormData({ equipmentId: '', techId: '', title: 'Monthly Preventative Check', description: 'Routine maintenance check logic.', priority: 'Medium' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[var(--color-surface-0)] rounded-[var(--radius-xl)] shadow-[var(--shadow-z3)] max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Schedule Maintenance</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}><X size={20} /></Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-[var(--color-brand-50)] p-3 rounded-[var(--radius-md)] flex items-center gap-2 text-[var(--color-brand-600)] text-sm font-medium">
                        <CalIcon size={16} />
                        Running for: {format(date, 'MMMM d, yyyy')}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)]">Equipment</label>
                        <select
                            required
                            className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border-200)] bg-[var(--color-surface-0)] text-sm focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
                            value={formData.equipmentId}
                            onChange={e => setFormData({ ...formData, equipmentId: e.target.value })}
                        >
                            <option value="">Select Equipment...</option>
                            {activeEquipment.map(eq => (
                                <option key={eq.id} value={eq.id}>{eq.name} ({eq.location})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)]">Assign Technician (Optional)</label>
                        <select
                            className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border-200)] bg-[var(--color-surface-0)] text-sm focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
                            value={formData.techId}
                            onChange={e => setFormData({ ...formData, techId: e.target.value })}
                        >
                            <option value="">Auto/None</option>
                            {technicians.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Title"
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-200)]">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Schedule Request
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Calendar = () => {
    const { requests, addRequest } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfWeek(endOfMonth(currentDate));
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const preventiveRequests = useMemo(() => {
        return requests.filter(r => r.type === 'Preventive');
    }, [requests]);

    const getDayRequests = (date: Date) => {
        return preventiveRequests.filter(r => isSameDay(parseISO(r.dueDate), date));
    };

    const generateId = () => `req-${Date.now()}`;

    const handleSchedule = (data: any) => {
        addRequest({
            id: generateId(),
            createdAt: new Date().toISOString(),
            logs: [{
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                message: 'Preventive maintenance scheduled via Calendar',
                authorId: 'manager'
            }],
            equipmentId: data.equipmentId,
            assignedTechId: data.techId || undefined,
            title: data.title,
            description: data.description,
            priority: data.priority,
            type: 'Preventive',
            status: 'New',
            dueDate: data.dueDate
        });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'New': return 'info';
            case 'In Progress': return 'warning';
            case 'Repaired': return 'success';
            default: return 'neutral';
        }
    };

    return (
        <Card noPadding className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[var(--color-border-200)] flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <CalIcon className="text-[var(--color-text-tertiary)]" />
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                        <ChevronLeft size={20} />
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())}>
                        Today
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 border-b border-[var(--color-border-200)] bg-[var(--color-surface-50)]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid Rules */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {days.map((day) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const dayRequests = getDayRequests(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className={clsx(
                                "min-h-[120px] p-2 border-b border-r border-[var(--color-border-100)] relative group transition-colors cursor-pointer",
                                !isCurrentMonth ? 'bg-[var(--color-surface-50)]' : 'bg-white hover:bg-[var(--color-surface-50)]'
                            )}
                            onClick={() => setSelectedDate(day)}
                        >
                            <span className={clsx(
                                "text-sm font-medium",
                                !isCurrentMonth ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-secondary)]'
                            )}>
                                {format(day, 'd')}
                            </span>

                            {/* Hover Add Button */}
                            <button className="absolute top-2 right-2 p-1 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-600)] opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus size={14} />
                            </button>

                            <div className="mt-2 space-y-1">
                                {dayRequests.map(req => (
                                    <div key={req.id} title={req.title}>
                                        <Badge variant={getStatusVariant(req.status) as any} size="sm" className="w-full justify-start truncate border-0">
                                            {req.title}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <ScheduleModal
                isOpen={!!selectedDate}
                date={selectedDate}
                onClose={() => setSelectedDate(null)}
                onSchedule={handleSchedule}
            />
        </Card>
    );
};

export default Calendar;

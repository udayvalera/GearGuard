import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Button } from '../design-system/Button';
import { Input } from '../design-system/Input';
import { X } from 'lucide-react';
import type { User, UserRole } from '../../types';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null; // If present, we are editing
}

export const UserModal = ({ isOpen, onClose, user }: UserModalProps) => {
    const { addUser, updateUser } = useData();
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('Employee');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setRole(user.role);
            // Mock email since it's not in the main type yet, or use name logic
            setEmail((user as any).email || user.name.toLowerCase().replace(' ', '.') + '@gearguard.com');
        } else {
            setName('');
            setRole('Employee');
            setEmail('');
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (user) {
            // Edit Mode
            updateUser({
                ...user,
                name,
                role
            });
        } else {
            // Add Mode
            addUser({
                id: `u-${Date.now()}`,
                name,
                role,
                avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}` // Random avatar
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[var(--color-surface-0)] rounded-[var(--radius-xl)] shadow-[var(--shadow-z3)] w-full max-w-[500px] p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                        {user ? 'Edit User' : 'Add New User'}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={onClose}><X size={20} /></Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="john.doe@gearguard.com"
                    />

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)]">Role</label>
                        <select
                            className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border-200)] bg-[var(--color-surface-0)] text-sm focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
                            value={role}
                            onChange={e => setRole(e.target.value as UserRole)}
                        >
                            <option value="Employee">Employee</option>
                            <option value="Technician">Technician</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-200)]">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {user ? 'Save Changes' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

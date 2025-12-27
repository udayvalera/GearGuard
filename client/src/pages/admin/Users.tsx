import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/design-system/Card';
import { Badge } from '../../components/design-system/Badge';
import { Button } from '../../components/design-system/Button';
import { Plus, User, Mail } from 'lucide-react';
import { UserModal } from '../../components/modals/UserModal';
import type { User as UserType } from '../../types';

const UsersPage = () => {
    const { users } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

    const handleEdit = (user: UserType) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">User Management</h1>
                    <p className="text-[var(--color-text-secondary)]">Manage system access and roles.</p>
                </div>
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleAdd}>
                    Add User
                </Button>
            </div>

            <Card className="overflow-hidden p-0">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--color-surface-50)] text-[var(--color-text-secondary)] text-sm font-semibold border-b border-[var(--color-border-200)]">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Email</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-200)]">
                        {/* @ts-ignore */}
                        {users.map((user: UserType) => (
                            <tr key={user.id} className="hover:bg-[var(--color-surface-50)] transition-colors">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-brand-100)] flex items-center justify-center text-[var(--color-brand-700)]">
                                        <User size={16} />
                                    </div>
                                    <span className="font-medium text-[var(--color-text-primary)]">{user.name}</span>
                                </td>
                                <td className="p-4">
                                    <Badge variant="neutral" className="capitalize">{user.role}</Badge>
                                </td>
                                <td className="p-4 text-[var(--color-text-secondary)]">
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} />
                                        {/* @ts-ignore */}
                                        {user.email}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>Edit</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
            />
        </div>
    );
};

export default UsersPage;

import { Search, Bell, Plus } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { useData } from '../../context/DataContext';

export const TopBar = () => {
    const { currentUser } = useData();

    return (
        <header className="h-16 border-b border-[var(--color-border-200)] bg-[var(--color-surface-0)] flex items-center justify-between px-4 sticky top-0 z-10 w-full">
            {/* Left spacer for centering */}
            <div className="flex-1 min-w-0" />
            
            {/* Centered Global Search - fixed width to prevent flex shrinking */}
            <div className="flex-shrink-0 w-[400px] transition-all duration-200">
                <Input
                    placeholder="Search..."
                    leftIcon={<Search size={18} className="text-[var(--color-text-tertiary)]" />}
                    className="h-10 bg-[var(--color-surface-50)] border-transparent focus:bg-white focus:border-[var(--color-brand-200)] focus:ring-[4px] focus:ring-[var(--color-brand-50)] rounded-[var(--radius-lg)] transition-all"
                />
            </div>

            {/* Right side actions */}
            <div className="flex-1 min-w-0 flex items-center justify-end gap-2">
                <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
                    Quick Create
                </Button>

                <div className="h-6 w-px bg-[var(--color-border-200)] mx-2"></div>

                <Button variant="ghost" size="sm" className="relative text-[var(--color-text-secondary)]">
                    <Bell size={20} />
                    <span className="absolute top-1 right-2 w-2 h-2 bg-[var(--color-error-600)] rounded-full border-2 border-[var(--color-surface-0)]"></span>
                </Button>

                <div className="flex items-center gap-3 pl-2">
                    <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-full border border-[var(--color-border-200)]"
                    />
                </div>
            </div>
        </header>
    );
};

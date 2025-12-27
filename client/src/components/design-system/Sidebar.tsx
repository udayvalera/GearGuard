import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Kanban, Calendar, BarChart3, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

const SidebarItem = ({ to, icon: Icon, label, collapsed }: { to: string; icon: any; label: string; collapsed: boolean }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            clsx(
                "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-200",
                isActive
                    ? "bg-[var(--color-brand-50)] text-[var(--color-brand-600)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-100)] hover:text-[var(--color-text-primary)]",
                collapsed && "justify-center px-2"
            )
        }
        title={collapsed ? label : undefined}
    >
        <Icon size={20} className={clsx(collapsed ? "min-w-[20px]" : "")} />
        {!collapsed && <span>{label}</span>}
    </NavLink>
);

export const Sidebar = () => {
    const [collapsed, setCollapsed] = React.useState(false);
    const { user } = useAuth();

    // Default to 'guest' or null if no user, preventing crash
    const currentRole = user?.role || null;

    // If no user/role (e.g. login page), don't render sidebar or render minimal
    // However, Sidebar is usually only in Protected routes. 
    // If it's rendering on Login, it means Layout is being used on Login.
    if (!currentRole) return null;

    return (
        <aside
            className={clsx(
                "bg-[var(--color-surface-0)] border-r border-[var(--color-border-200)] flex flex-col transition-all duration-300 relative z-20",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="h-16 flex items-center px-4 border-b border-[var(--color-border-200)]">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-[var(--color-brand-600)] p-1.5 rounded-[var(--radius-md)] flex-shrink-0">
                        <ShieldCheck className="text-white" size={20} />
                    </div>
                    {!collapsed && (
                        <div>
                            <h1 className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">GearGuard</h1>
                            <p className="text-[10px] text-[var(--color-text-tertiary)] font-bold tracking-wider uppercase">{currentRole}</p>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
                {/* Common Dashboard */}
                <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />

                {(currentRole === 'MANAGER' || currentRole === 'TECHNICIAN') && (
                    <>
                        <SidebarItem to="/kanban" icon={Kanban} label="Work Board" collapsed={collapsed} />
                        <SidebarItem to="/calendar" icon={Calendar} label="Schedule" collapsed={collapsed} />
                    </>
                )}

                {currentRole === 'MANAGER' && (
                    <SidebarItem to="/reports" icon={BarChart3} label="Reports" collapsed={collapsed} />
                )}

                {currentRole === 'EMPLOYEE' && (
                    <>
                        <SidebarItem to="/my-requests" icon={Kanban} label="My Requests" collapsed={collapsed} />
                        <SidebarItem to="/my-equipment" icon={ShieldCheck} label="My Equipment" collapsed={collapsed} />
                    </>
                )}

                {currentRole === 'ADMIN' && (
                    <>
                        <SidebarItem to="/users" icon={ShieldCheck} label="Users" collapsed={collapsed} />
                        <SidebarItem to="/teams" icon={ShieldCheck} label="Teams" collapsed={collapsed} />
                        <SidebarItem to="/equipment" icon={ShieldCheck} label="Equipment" collapsed={collapsed} />
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-[var(--color-border-200)] flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </Button>
            </div>
        </aside>
    );
};

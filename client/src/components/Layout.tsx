import { Outlet } from 'react-router-dom';
import { Sidebar } from './design-system/Sidebar';
import { TopBar } from './design-system/TopBar';

const AppLayout = () => {
    return (
        <div className="flex h-screen bg-[var(--color-surface-50)] overflow-hidden font-sans text-[var(--color-text-primary)]">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <TopBar />

                <main className="flex-1 overflow-auto relative scroll-smooth">
                    <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;

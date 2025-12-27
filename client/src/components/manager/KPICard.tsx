import React from 'react';
import { Card } from '../design-system/Card';
import { clsx } from 'clsx';

interface KPICardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    variant?: 'neutral' | 'dangerous';
    trend?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon, variant = 'neutral' }) => {
    const isDangerous = variant === 'dangerous';

    return (
        <Card className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</p>
                <p className={clsx(
                    "text-3xl font-bold mt-1",
                    isDangerous ? "text-[var(--color-error-600)]" : "text-[var(--color-text-primary)]"
                )}>
                    {value}
                </p>
            </div>
            <div className={clsx(
                "p-3 rounded-full",
                isDangerous ? "bg-red-50 text-[var(--color-error-600)]" : "bg-slate-50 text-[var(--color-text-secondary)]"
                // Note: Using slate-50/text-secondary as default neutral icon background as per previous design, 
                // but aligned with tokens.
            )}>
                {icon}
            </div>
        </Card>
    );
};

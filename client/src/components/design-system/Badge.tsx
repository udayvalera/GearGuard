import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = 'neutral', size = 'sm', ...props }, ref) => {

        const baseStyles = "inline-flex items-center font-medium rounded-full border";

        const variants = {
            neutral: "bg-slate-100 text-slate-700 border-slate-200", // Fallback for neutral
            success: "bg-green-50 text-[var(--color-success-600)] border-green-200",
            warning: "bg-orange-50 text-[var(--color-warning-500)] border-orange-200",
            error: "bg-red-50 text-[var(--color-error-600)] border-red-200",
            info: "bg-blue-50 text-[var(--color-info-500)] border-blue-200",
        };

        const sizes = {
            sm: "px-2.5 py-0.5 text-xs",
            md: "px-3 py-1 text-sm",
        };

        return (
            <div
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            />
        );
    }
);

Badge.displayName = "Badge";

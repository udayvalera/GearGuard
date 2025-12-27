import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'link' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-[var(--radius-md)]";

        const variants = {
            primary: "bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-500)] shadow-[var(--shadow-z1)]",
            secondary: "bg-[var(--color-surface-0)] text-[var(--color-text-primary)] border border-[var(--color-border-200)] hover:bg-[var(--color-surface-50)] shadow-[var(--shadow-z1)]",
            ghost: "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-100)] hover:text-[var(--color-text-primary)]",
            link: "text-[var(--color-brand-600)] underline-offset-4 hover:underline",
            danger: "bg-[var(--color-error-600)] text-white hover:bg-red-700 shadow-[var(--shadow-z1)]",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs gap-1.5",
            md: "h-10 px-4 text-sm gap-2",
            lg: "h-12 px-6 text-base gap-2.5",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />}
                {!isLoading && leftIcon}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = "Button";

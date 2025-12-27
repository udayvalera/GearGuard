import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, leftIcon, id, ...props }, ref) => {
        const inputId = id || React.useId();

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-[var(--color-text-secondary)]"
                    >
                        {label}
                    </label>
                )}
                <div className="relative w-full">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        ref={ref}
                        className={cn(
                            "flex h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border-200)] bg-[var(--color-surface-0)] px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm hover:border-[var(--color-text-tertiary)]",
                            leftIcon && "pl-10",
                            error && "border-[var(--color-error-600)] focus-visible:ring-[var(--color-error-600)]",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <span className="text-xs text-[var(--color-error-600)] font-medium">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

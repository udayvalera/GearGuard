import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, noPadding, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "bg-[var(--color-surface-0)] rounded-[var(--radius-lg)] border border-[var(--color-border-200)] shadow-[var(--shadow-z1)]",
                    !noPadding && "p-[var(--spacing-lg)]",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    tooltip?: string;
    className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
    icon: Icon,
    label,
    onClick,
    variant = 'default',
    size = 'md',
    disabled = false,
    loading = false,
    tooltip,
    className = '',
}) => {
    const sizeClasses = {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
    };

    const button = (
        <Button
            variant={variant}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${sizeClasses[size]} ${className} inline-flex items-center gap-2 transition-all duration-200`}
        >
            <Icon className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} ${loading ? 'animate-spin' : ''}`} />
            {label}
        </Button>
    );

    if (tooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {button}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return button;
};
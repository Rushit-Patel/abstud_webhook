import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
    status: 'active' | 'inactive' | 'draft' | 'error';
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
    status, 
    size = 'md', 
    showIcon = true 
}) => {
    const variants = {
        active: {
            variant: 'default' as const,
            icon: CheckCircle,
            label: 'Active',
            className: 'bg-green-100 text-green-800 border-green-200',
        },
        inactive: {
            variant: 'secondary' as const,
            icon: XCircle,
            label: 'Inactive',
            className: 'bg-gray-100 text-gray-800 border-gray-200',
        },
        draft: {
            variant: 'outline' as const,
            icon: Clock,
            label: 'Draft',
            className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        },
        error: {
            variant: 'destructive' as const,
            icon: AlertTriangle,
            label: 'Error',
            className: 'bg-red-100 text-red-800 border-red-200',
        },
    };

    const config = variants[status];
    const Icon = config.icon;
    
    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    return (
        <Badge 
            variant={config.variant}
            className={`${config.className} ${sizeClasses[size]} inline-flex items-center gap-1`}
        >
            {showIcon && <Icon className="h-3 w-3" />}
            {config.label}
        </Badge>
    );
};
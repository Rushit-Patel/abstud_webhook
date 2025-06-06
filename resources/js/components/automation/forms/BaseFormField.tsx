import React from 'react';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface BaseFormFieldProps {
    label: string;
    error?: string;
    warning?: string;
    required?: boolean;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export const BaseFormField: React.FC<BaseFormFieldProps> = ({
    label,
    error,
    warning,
    required = false,
    description,
    children,
    className = '',
}) => {
    return (
        <div className={cn('space-y-2', className)}>
            <Label className={cn(
                'text-sm font-medium text-gray-700',
                required && "after:content-['*'] after:ml-0.5 after:text-red-500"
            )}>
                {label}
            </Label>
            
            {description && (
                <p className="text-sm text-gray-500">{description}</p>
            )}
            
            {children}
            
            {error && (
                <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
            )}
            
            {warning && !error && (
                <Alert className="py-2 border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-xs text-yellow-700">{warning}</AlertDescription>
                </Alert>
            )}
        </div>
    );
};
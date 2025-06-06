import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BaseFormField } from './BaseFormField';
import { SelectOption } from '@/types/automation';

interface SelectFieldProps {
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    warning?: string;
    required?: boolean;
    description?: string;
    disabled?: boolean;
    className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
    label,
    value,
    options,
    onChange,
    placeholder = 'Select an option...',
    error,
    warning,
    required = false,
    description,
    disabled = false,
    className = '',
}) => {
    return (
        <BaseFormField
            label={label}
            error={error}
            warning={warning}
            required={required}
            description={description}
            className={className}
        >
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem 
                            key={option.value} 
                            value={option.value}
                            disabled={option.disabled}
                        >
                            <div className="flex items-center gap-2">
                                {option.icon && option.icon}
                                {option.label}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </BaseFormField>
    );
};
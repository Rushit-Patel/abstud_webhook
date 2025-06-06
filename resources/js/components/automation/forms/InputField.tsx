import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BaseFormField } from './BaseFormField';

interface InputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'email' | 'url' | 'number' | 'password';
    placeholder?: string;
    error?: string;
    warning?: string;
    required?: boolean;
    description?: string;
    disabled?: boolean;
    multiline?: boolean;
    rows?: number;
    maxLength?: number;
    className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    error,
    warning,
    required = false,
    description,
    disabled = false,
    multiline = false,
    rows = 3,
    maxLength,
    className = '',
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    return (
        <BaseFormField
            label={label}
            error={error}
            warning={warning}
            required={required}
            description={description}
            className={className}
        >
            {multiline ? (
                <div className="space-y-1">
                    <Textarea
                        value={value}
                        onChange={handleChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={rows}
                        maxLength={maxLength}
                        className="resize-none"
                    />
                    {maxLength && (
                        <div className="text-xs text-gray-500 text-right">
                            {value.length}/{maxLength}
                        </div>
                    )}
                </div>
            ) : (
                <Input
                    type={type}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={maxLength}
                />
            )}
        </BaseFormField>
    );
};
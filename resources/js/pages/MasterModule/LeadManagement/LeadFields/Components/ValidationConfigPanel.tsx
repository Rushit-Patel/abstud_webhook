import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface ValidationOptions {
    min?: string;
    max?: string;
    pattern?: string;
    [key: string]: string | undefined;
}

interface ValidationConfigPanelProps {
    validation: ValidationOptions;
    onChange: (name: string, value: string) => void;
    fieldType: string;
}

export default function ValidationConfigPanel({ validation, onChange, fieldType }: ValidationConfigPanelProps) {
    const [uniqueField, setUniqueField] = useState(false);
    // Common validation patterns
    const commonPatterns = [
        { label: 'None', value: 'none'},
        { label: 'Email', value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        { label: 'URL', value: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*\\/?$' },
        { label: 'Phone', value: '^\\+?[0-9]{10,15}$' },
        { label: 'Alphanumeric', value: '^[a-zA-Z0-9]+$' },
        { label: 'Letters Only', value: '^[a-zA-Z]+$' },
        { label: 'Numbers Only', value: '^[0-9]+$' },
    ];

    const getValidationFields = () => {
        switch (fieldType) {
            case 'text':
            case 'textarea':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="min">Minimum Length</Label>
                                <Input
                                    id="min"
                                    type="number"
                                    min="0"
                                    value={validation.min || ''}
                                    onChange={(e) => onChange('min', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max">Maximum Length</Label>
                                <Input
                                    id="max"
                                    type="number"
                                    min="0"
                                    value={validation.max || ''}
                                    onChange={(e) => onChange('max', e.target.value)}
                                    placeholder="255"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pattern">Validation Pattern</Label>
                            <Select value={validation.pattern || ''} onValueChange={(value) => onChange('pattern', value)}>
                                <SelectTrigger id="pattern">
                                    <SelectValue placeholder="Select validation pattern" />
                                </SelectTrigger>
                                <SelectContent>
                                    {commonPatterns.map((pattern) => {
                                        return (
                                            <SelectItem key={pattern.label} value={pattern.value}>
                                                {pattern.label}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            {validation.pattern && (
                                <div className="mt-2">
                                    <Label htmlFor="pattern-input">Custom Pattern</Label>
                                    <Input
                                        id="pattern-input"
                                        value={validation.pattern}
                                        onChange={(e) => onChange('pattern', e.target.value)}
                                        placeholder="Regular expression"
                                        className="mt-1"
                                    />
                                </div>
                            )}
                        </div>
                    </>
                );
            case 'number':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="min">Minimum Value</Label>
                            <Input
                                id="min"
                                type="number"
                                value={validation.min || ''}
                                onChange={(e) => onChange('min', e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max">Maximum Value</Label>
                            <Input
                                id="max"
                                type="number"
                                value={validation.max || ''}
                                onChange={(e) => onChange('max', e.target.value)}
                                placeholder="999999"
                            />
                        </div>
                    </div>
                );
            case 'email':
                return (
                    <div className="rounded-md bg-gray-50 p-4">
                        <p className="text-sm text-gray-600">Email fields are automatically validated using a standard email format.</p>
                    </div>
                );
            case 'phone':
                return (
                    <div className="space-y-2">
                        <Label htmlFor="pattern">Phone Format</Label>
                        <Select value={validation.pattern || ''} onValueChange={(value) => onChange('pattern', value)}>
                            <SelectTrigger id="pattern">
                                <SelectValue placeholder="Select phone format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="^\\+?[0-9]{10,15}$">International (10-15 digits)</SelectItem>
                                <SelectItem value="^[0-9]{10}$">Standard (10 digits)</SelectItem>
                                <SelectItem value="^\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}$">US Format (xxx) xxx-xxxx</SelectItem>
                                <SelectItem value=" ">Any Format</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );
            case 'url':
                return (
                    <div className="rounded-md bg-gray-50 p-4">
                        <p className="text-sm text-gray-600">URL fields are automatically validated for proper URL format.</p>
                    </div>
                );
            default:
                return (
                    <div className="rounded-md bg-gray-50 p-4">
                        <p className="text-sm text-gray-600">No additional validation options available for this field type.</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-4">
            <Alert>
                <AlertDescription>Set validation rules for this {fieldType} field to ensure data quality.</AlertDescription>
            </Alert>

            <div className="space-y-4">
                {getValidationFields()}

                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="unique"
                        checked={uniqueField}
                        onCheckedChange={(checked) => {
                            setUniqueField(checked as boolean);
                            onChange('unique', checked ? 'true' : 'false');
                        }}
                    />
                    <Label htmlFor="unique">Enforce unique values</Label>
                </div>
            </div>
        </div>
    );
}

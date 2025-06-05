import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { LeadField } from '@/types/lead';
import OptionsConfigPanel from './OptionsConfigPanel';
import ValidationConfigPanel from './ValidationConfigPanel';
import { toast } from 'sonner';

interface CustomFieldDialogProps {
    isOpen: boolean;
    onClose: () => void;
    field: LeadField | null;
}

const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'select', label: 'Dropdown' },
    { value: 'multiselect', label: 'Multi Select' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Button' },
    { value: 'date', label: 'Date' },
    { value: 'url', label: 'URL' },
];

export default function CustomFieldDialog({ isOpen, onClose, field }: CustomFieldDialogProps) {
    const [formData, setFormData] = useState<Partial<LeadField>>({
        name: '',
        label: '',
        type: 'text',
        options: [],
        settings: {
            required: false,
            unique: false,
            placeholder: '',
            default_value: '',
            validation: {
                min: '',
                max: '',
                pattern: '',
            },
        },
        is_active: true,
    });

    const [currentTab, setCurrentTab] = useState('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when dialog opens/closes or editing field changes
    useEffect(() => {
        if (isOpen) {
            if (field) {
                // Editing existing field
                setFormData({
                    ...field,
                    options: field.options || [],
                    settings: field.settings || {
                        required: false,
                        unique: false,
                        placeholder: '',
                        default_value: '',
                        validation: {
                            min: '',
                            max: '',
                            pattern: '',
                        },
                    },
                });
            } else {
                // Creating new field
                setFormData({
                    name: '',
                    label: '',
                    type: 'text',
                    options: [],
                    settings: {
                        required: false,
                        unique: false,
                        placeholder: '',
                        default_value: '',
                        validation: {
                            min: '',
                            max: '',
                            pattern: '',
                        },
                    },
                    is_active: true,
                });
            }
            setCurrentTab('general');
            setErrors({});
        }
    }, [isOpen, field]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTypeChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            type: value,
            // Reset options if changing from a type that uses options to one that doesn't
            options: ['select', 'multiselect', 'checkbox', 'radio'].includes(value) ? prev.options || [] : [],
        }));
    };

    const handleCheckboxChange = (checked: boolean, name: string) => {
        if (name === 'is_active') {
            setFormData((prev) => ({ ...prev, is_active: checked }));
        } else {
            // For settings checkboxes
            setFormData((prev) => ({
                ...prev,
                settings: {
                    ...prev.settings,
                    [name]: checked,
                },
            }));
        }
    };

    const handleSettingChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            settings: {
                ...prev.settings,
                [name]: value,
            },
        }));
    };

    const handleValidationChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            settings: {
                ...prev.settings,
                validation: {
                    ...prev.settings?.validation,
                    [name]: value,
                },
            },
        }));
    };

    const handleOptionsChange = (options: any[]) => {
        setFormData((prev) => ({ ...prev, options }));
    };

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .replace(/_{2,}/g, '_');
    };

    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const label = e.target.value;
        setFormData((prev) => {
            // Only auto-generate name if it's empty or matches previous auto-generated name
            const shouldUpdateName = !prev.name || prev.name === generateSlug(prev.label || '');
            return {
                ...prev,
                label,
                name: shouldUpdateName ? generateSlug(label) : prev.name,
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate form
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Field name is required';
        if (!formData.label) newErrors.label = 'Field label is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }
        // Submit form using Inertia
        const url = field ? route('lead-management.lead-fields.update', field.id) : route('lead-management.lead-fields.store');
        const method = field ? 'put' : 'post';
        router[method](url, formData as any, {
            onSuccess: () => {
                onClose();
                setIsSubmitting(false);
                toast.success('Submit Data Fields Successfuly!');
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
                toast.error('Something went worng!');
            },
        });
    };

    const needsOptionsTab = ['select', 'multiselect', 'checkbox', 'radio'].includes(formData.type || '');
    const needsValidationTab = ['text', 'textarea', 'number', 'email', 'phone', 'url'].includes(formData.type || '');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{field ? 'Edit Custom Field' : 'Add Custom Field'}</DialogTitle>
                        <DialogDescription>
                            {field
                                ? 'Update this custom field to collect specific information from your leads.'
                                : 'Create a custom field to collect specific information from your leads.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Tabs value={currentTab} onValueChange={setCurrentTab}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="general">General</TabsTrigger>
                                {needsOptionsTab && <TabsTrigger value="options">Options</TabsTrigger>}
                                {needsValidationTab && <TabsTrigger value="validation">Validation</TabsTrigger>}
                            </TabsList>

                            <TabsContent value="general" className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="label">Label</Label>
                                        <Input
                                            id="label"
                                            name="label"
                                            value={formData.label || ''}
                                            onChange={handleLabelChange}
                                            placeholder="First Name"
                                            className={errors.label ? 'border-red-500' : ''}
                                        />
                                        {errors.label && <p className="text-sm text-red-500">{errors.label}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name">Field Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name || ''}
                                            onChange={handleInputChange}
                                            placeholder="first_name"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        <p className="text-xs text-gray-500">Used as identifier in the database. No spaces or special characters.</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Field Type</Label>
                                    <Select value={formData.type || 'text'} onValueChange={handleTypeChange}>
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Select field type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fieldTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="placeholder">Placeholder</Label>
                                    <Input
                                        id="placeholder"
                                        value={formData.settings?.placeholder || ''}
                                        onChange={(e) => handleSettingChange('placeholder', e.target.value)}
                                        placeholder="Enter placeholder text"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="default_value">Default Value</Label>
                                    <Input
                                        id="default_value"
                                        value={formData.settings?.default_value || ''}
                                        onChange={(e) => handleSettingChange('default_value', e.target.value)}
                                        placeholder="Enter default value"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="required"
                                        checked={formData.settings?.required || false}
                                        onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, 'required')}
                                    />
                                    <Label htmlFor="required">Required Field</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => handleCheckboxChange(checked, 'is_active')}
                                    />
                                    <Label htmlFor="is_active">Active</Label>
                                </div>
                            </TabsContent>

                            {needsOptionsTab && (
                                <TabsContent value="options">
                                    <OptionsConfigPanel
                                        options={formData.options || []}
                                        onChange={handleOptionsChange}
                                        fieldType={formData.type || 'select'}
                                    />
                                </TabsContent>
                            )}

                            {needsValidationTab && (
                                <TabsContent value="validation">
                                    <ValidationConfigPanel
                                        validation={formData.settings?.validation || {}}
                                        onChange={handleValidationChange}
                                        fieldType={formData.type || 'text'}
                                    />
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : field ? 'Update Field' : 'Add Field'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

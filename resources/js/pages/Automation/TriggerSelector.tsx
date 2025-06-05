// src/components/automation/TriggerSelector.tsx
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trigger } from '@/types/automation';
import { X, Facebook, Webhook, UserPlus, RefreshCcw, Plus } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TriggerOption {
    id: string;
    icon: React.ReactNode;
    name: string;
    description: string;
    category: 'leads' | 'integrations';
    isPremium?: boolean;
}

interface TriggerSelectorProps {
    selectedTrigger?: Trigger;
    onClose: () => void;
    onChange: (trigger: Trigger) => void;
}

interface FacebookPage {
    id: string;
    name: string;
    access_token: string;
    category: string;
    tasks: string[];
}

interface Integration {
    id: string;
    type_id: string;
    name: string;
    meta: {
        pages: FacebookPage[];
    };
}

interface FacebookForm {
    id: string;
    name: string;
}

interface FormField {
    id: string;
    name: string;
    type: string;
}

const triggerOptions: TriggerOption[] = [
    // Lead Management Triggers
    {
        id: 'create_new_lead',
        icon: <UserPlus className="w-5 h-5" />,
        name: 'Create New Lead',
        description: 'Triggers when a new lead is created in the system',
        category: 'leads'
    },
    {
        id: 'update_lead_status',
        icon: <RefreshCcw className="w-5 h-5" />,
        name: 'Lead Status Updated',
        description: 'Triggers when a lead\'s status is changed',
        category: 'leads'
    },
    
    // Integration Triggers
    {
        id: 'facebook_lead_form',
        icon: <Facebook className="w-5 h-5" />,
        name: 'Facebook Lead Form',
        description: 'Triggers when a new lead submits your Facebook lead form',
        category: 'integrations'
    },
    {
        id: 'inbound_webhook',
        icon: <Webhook className="w-5 h-5" />,
        name: 'Inbound Webhook',
        description: 'Triggers when data is received from an external system via webhook',
        category: 'integrations',
        isPremium: true
    }
];

const staticPages = [
    { id: '1', name: 'Amratpal A Vision Pvt Ltd.' }
];

const staticForms = [
    { id: '1', name: 'Lead Form 1' }
];

const TriggerSelector: React.FC<TriggerSelectorProps> = ({ selectedTrigger, onClose, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTriggerId, setSelectedTriggerId] = useState<string>(selectedTrigger?.type || '');
    const [triggerName, setTriggerName] = useState('');
    const [selectedPage, setSelectedPage] = useState<string>('');
    const [selectedForms, setSelectedForms] = useState<string[]>([]);
    const [pages, setPages] = useState<FacebookPage[]>([]);
    const [forms, setForms] = useState<FacebookForm[]>([]);
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [selectedFields, setSelectedFields] = useState<Array<{field: string, operator: string, value: string}>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFormFields, setSelectedFormFields] = useState<Record<string, FormField[]>>({});
    const [isFormsOpen, setIsFormsOpen] = useState(false);

    const filteredTriggers = triggerOptions.filter(trigger =>
        trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trigger.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedTriggers = filteredTriggers.reduce((acc, trigger) => {
        if (!acc[trigger.category]) {
            acc[trigger.category] = [];
        }
        acc[trigger.category].push(trigger);
        return acc;
    }, {} as Record<string, TriggerOption[]>);

    // Fetch Facebook pages when Facebook trigger is selected
    useEffect(() => {
        if (selectedTriggerId === 'facebook_lead_form') {
            fetchFacebookPages();
        }
    }, [selectedTriggerId]);

    // Fetch Facebook forms when a page is selected
    useEffect(() => {
        if (selectedPage) {
            fetchFacebookForms(selectedPage);
        }
    }, [selectedPage]);

    const fetchFacebookPages = async () => {
        try {
            setLoading(true);
            const response = await axios.get(route('automation.facebookPages'));
            // Extract pages from the integration meta
            if (response.data && response.data.meta) {
                const meta = typeof response.data.meta === 'string' 
                    ? JSON.parse(response.data.meta) 
                    : response.data.meta;
                setPages(meta.pages || []);
            } else {
                setPages([]);
            }
            setError(null);
        } catch (err: any) {
            console.error('Error fetching pages:', err);
            setError(err.response?.data?.message || 'Failed to fetch Facebook pages');
            setPages([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFacebookForms = async (pageId: string) => {
        try {
            setLoading(true);
            // Find the selected page to get its access token
            const selectedPage = pages.find(page => page.id === pageId);
            if (!selectedPage) {
                throw new Error('Selected page not found');
            }

            const response = await axios.get(route('automation.facebookForms', { 
                pageId,
                access_token: selectedPage.access_token 
            }));
            setForms(response.data || []);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching forms:', err);
            setError(err.response?.data?.message || 'Failed to fetch Facebook forms');
            setForms([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFormFields = async (formId: string) => {
        try {
            setLoading(true);
            // Find the selected page to get its access token
            const currentPage = pages.find(page => page.id === selectedPage);
            if (!currentPage) {
                throw new Error('Selected page not found');
            }

            const response = await axios.get(route('automation.facebookFormFields', { 
                formId,
                access_token: currentPage.access_token 
            }));

            setSelectedFormFields(prev => ({
                ...prev,
                [formId]: response.data || []
            }));
            setError(null);
        } catch (err: any) {
            console.error('Error fetching form fields:', err);
            setError(err.response?.data?.message || 'Failed to fetch form fields');
        } finally {
            setLoading(false);
        }
    };

    // Fetch form fields when forms are selected
    useEffect(() => {
        selectedForms.forEach(formId => {
            if (!selectedFormFields[formId]) {
                fetchFormFields(formId);
            }
        });
    }, [selectedForms]);

    const handleAddFilter = () => {
        setSelectedFields([...selectedFields, { field: '', operator: '', value: '' }]);
    };

    const handleRemoveFilter = (index: number) => {
        const newFields = [...selectedFields];
        newFields.splice(index, 1);
        setSelectedFields(newFields);
    };

    const handleFieldChange = (index: number, key: string, value: string) => {
        const newFields = [...selectedFields];
        newFields[index] = { ...newFields[index], [key]: value };
        setSelectedFields(newFields);
    };

    const handleFormSelect = (formId: string) => {
        setSelectedForms(prev => {
            const newForms = prev.includes(formId)
                ? prev.filter(id => id !== formId)
                : [...prev, formId];
            
            // Clean up form fields if form is deselected
            if (!newForms.includes(formId)) {
                setSelectedFormFields(prev => {
                    const newFields = { ...prev };
                    delete newFields[formId];
                    return newFields;
                });
            }
            
            return newForms;
        });
    };

    const handleTriggerSelect = (triggerId: string) => {
        setSelectedTriggerId(triggerId);
        if (triggerId === 'inbound_webhook') {
            // Generate a unique webhook URL
            setSelectedForms([]);
        }
    };

    // Get unique fields from all selected forms
    const uniqueFormFields = useMemo(() => {
        const allFields = Object.values(selectedFormFields).flat();
        const uniqueFields = allFields.reduce((acc, field) => {
            if (!acc.find(f => f.id === field.id)) {
                acc.push(field);
            }
            return acc;
        }, [] as FormField[]);
        return uniqueFields;
    }, [selectedFormFields]);

    const filteredForms = forms.filter(form => 
        form.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-y-0 right-0 w-[500px] bg-white border-l shadow-lg">
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold">Workflow Trigger</h2>
                        <p className="text-sm text-gray-500">
                            Adds a workflow trigger, and on execution, the Contact gets added to the workflow.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-6">
                        {/* Trigger Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">CHOOSE A WORKFLOW TRIGGER</label>
                            <Select value={selectedTriggerId} onValueChange={setSelectedTriggerId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Facebook lead form submitted" />
                                </SelectTrigger>
                                <SelectContent>
                                    {triggerOptions.map((trigger) => (
                                        <SelectItem key={trigger.id} value={trigger.id}>
                                            <div className="flex items-center gap-2">
                                                <div className="text-gray-600">{trigger.icon}</div>
                                                <span>{trigger.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Trigger Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">WORKFLOW TRIGGER NAME</label>
                            <Input
                                value={triggerName}
                                onChange={(e) => setTriggerName(e.target.value)}
                                placeholder="Facebook Lead Form Submitted"
                            />
                        </div>

                        {selectedTriggerId === 'facebook_lead_form' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">FILTERS</label>
                                    <p className="text-sm text-gray-500">
                                        Please ensure your facebook form fields are mapped <a href="#" className="text-blue-500">here</a>
                                    </p>
                                </div>

                                {/* Page Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Page Is</label>
                                    <Select value={selectedPage} onValueChange={setSelectedPage}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Facebook page" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pages.map((page) => (
                                                <SelectItem key={page.id} value={page.id}>
                                                    <div className="flex flex-col">
                                                        <span>{page.name}</span>
                                                        <span className="text-xs text-gray-500">{page.category}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Forms Selection */}
                                {selectedPage && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Form Is</label>
                                        <div className="relative">
                                            <div 
                                                className="w-full border rounded-md p-2 min-h-[38px] cursor-pointer"
                                                onClick={() => setIsFormsOpen(!isFormsOpen)}
                                            >
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedForms.length > 0 ? (
                                                        selectedForms.map((formId) => {
                                                            const form = forms.find(f => f.id === formId);
                                                            return form && (
                                                                <Badge
                                                                    key={formId}
                                                                    variant="secondary"
                                                                    className="flex items-center gap-1 bg-blue-100 text-blue-700"
                                                                >
                                                                    {form.name}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleFormSelect(formId);
                                                                        }}
                                                                        className="ml-1 hover:text-red-500"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </Badge>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-gray-500">Select forms...</span>
                                                    )}
                                                </div>
                                            </div>

                                            {isFormsOpen && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
                                                    <div className="p-2 border-b">
                                                        <Input
                                                            type="text"
                                                            placeholder="Type to search"
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    <div className="max-h-[200px] overflow-y-auto">
                                                        {loading ? (
                                                            <div className="p-3 text-sm text-gray-500">Loading forms...</div>
                                                        ) : filteredForms.length === 0 ? (
                                                            <div className="p-3 text-sm text-gray-500">No forms found</div>
                                                        ) : (
                                                            filteredForms.map((form) => (
                                                                <div
                                                                    key={form.id}
                                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                                                                    onClick={() => handleFormSelect(form.id)}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedForms.includes(form.id)}
                                                                        onChange={() => {}}
                                                                        className="h-4 w-4 rounded border-gray-300"
                                                                    />
                                                                    <span className="flex-1 text-sm">{form.name}</span>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Add Filters Button */}
                                <button 
                                    className="flex items-center gap-1 text-sm text-blue-600"
                                    onClick={handleAddFilter}
                                >
                                    <span className="text-lg">⊕</span> Add filters
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4 flex justify-end space-x-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => {
                            const trigger: Trigger = {
                                type: selectedTriggerId,
                                pageId: selectedPage,
                                formId: selectedForms.join(','),
                                config: {
                                    filters: selectedFields
                                }
                            };
                            onChange(trigger);
                            onClose();
                        }}
                    >
                        Save Trigger
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TriggerSelector;

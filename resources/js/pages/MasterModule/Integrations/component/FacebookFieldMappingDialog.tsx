import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Facebook } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

interface LeadField {
    id: number;
    name: string;
    label: string;
    type: string;
}

interface Mapping {
    facebook_field_name: string;
    lead_field_id: number | null;
}

interface FacebookFieldMappingDialogProps {
    open: boolean;
    onClose: () => void;
    formId: number;
    formName: string;
    questions: string;
    existingMappings?: Mapping[];
    onMappingSaved: () => void;
}

export default function FacebookFieldMappingDialog({
    open,
    onClose,
    formId,
    formName,
    questions,
    existingMappings = [],
    onMappingSaved
}: FacebookFieldMappingDialogProps) {
    // Parse questions once, not on every render
    const parsedQuestions = useRef<any[]>([]);
    
    // Only parse if we haven't already or if questions changed
    if (!parsedQuestions.current.length) {
        try {
            if (typeof questions === 'string') {
                parsedQuestions.current = JSON.parse(questions);
            } else if (Array.isArray(questions)) {
                parsedQuestions.current = questions;
            }
        } catch (e) {
            console.error("Error parsing questions:", e);
            parsedQuestions.current = [];
        }
    }

    const [leadFields, setLeadFields] = useState<LeadField[]>([]);
    const [mappings, setMappings] = useState<Mapping[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Initialize only once when the dialog opens
    useEffect(() => {
        if (!open || initialized) return;
        
        const initializeComponent = async () => {
            setLoading(true);
            
            try {
                // Fetch lead fields
                const fieldsResponse = await axios.get(route('integrations.facebook.lead-fields'));
                setLeadFields(fieldsResponse.data.lead_fields);
                
                // Initialize mappings
                let initialMappings: Mapping[] = [];
                
                // First priority: use existing mappings from props
                if (existingMappings && existingMappings.length > 0) {
                    initialMappings = parsedQuestions.current.map(question => {
                        const existingMap = existingMappings.find(
                            mapping => mapping.facebook_field_name === question.key
                        );
                        
                        return {
                            facebook_field_name: question.key,
                            lead_field_id: existingMap?.lead_field_id || null
                        };
                    });
                } 
                // Second priority: fetch existing mappings from API
                else {
                    try {
                        const mappingsResponse = await axios.get(route('integrations.facebook.form-mappings'), {
                            params: { form_id: formId }
                        });
                        
                        if (mappingsResponse.data.success && mappingsResponse.data.mappings && mappingsResponse.data.mappings.length > 0) {
                            initialMappings = parsedQuestions.current.map(question => {
                                const apiMapping = mappingsResponse.data.mappings.find(
                                    (m: Mapping) => m.facebook_field_name === question.key
                                );
                                
                                return {
                                    facebook_field_name: question.key,
                                    lead_field_id: apiMapping?.lead_field_id || null
                                };
                            });
                        } 
                        // Last resort: create empty mappings
                        else {
                            initialMappings = parsedQuestions.current.map(question => ({
                                facebook_field_name: question.key,
                                lead_field_id: null
                            }));
                        }
                    } catch (err) {
                        console.error("Error fetching mappings:", err);
                        // Create default mappings
                        initialMappings = parsedQuestions.current.map(question => ({
                            facebook_field_name: question.key,
                            lead_field_id: null
                        }));
                    }
                }
                
                setMappings(initialMappings);
                setInitialized(true);
            } catch (error) {
                console.error("Error initializing component:", error);
                toast.error('Failed to load form data');
            } finally {
                setLoading(false);
            }
        };
        
        initializeComponent();
    }, [open]);

    // Reset initialization when dialog closes
    useEffect(() => {
        if (!open) {
            setInitialized(false);
        }
    }, [open]);

    const handleMappingChange = (facebookFieldName: string, leadFieldId: number | null) => {
        setMappings(prev => 
            prev.map(mapping => 
                mapping.facebook_field_name === facebookFieldName 
                    ? { ...mapping, lead_field_id: leadFieldId }
                    : mapping
            )
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await axios.post(route('integrations.facebook.save-mappings'), {
                form_id: formId,
                mappings: mappings.filter(m => m.lead_field_id !== null)
            });
            
            if (response.data.success) {
                toast.success('Field mappings saved successfully');
                onMappingSaved();
                onClose();
            } else {
                toast.error(response.data.message || 'Failed to save mappings');
            }
        } catch (error) {
            toast.error('Failed to save field mappings');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Facebook size={20} className="text-blue-600" />
                        Map Fields for "{formName}"
                    </DialogTitle>
                    <DialogDescription>
                        Map Facebook form fields to your lead fields in the CRM
                    </DialogDescription>
                </DialogHeader>
                
                {loading ? (
                    <div className="py-4 text-center">Loading fields...</div>
                ) : (
                    <>
                        <div className="space-y-4 max-h-96 overflow-y-auto py-2">
                            
                            {parsedQuestions.current.map((field, index) => (
                                <div key={index} className="grid grid-cols-5 gap-4 items-center">
                                    <div className="col-span-2">
                                        <p className="text-sm font-medium">{field.label}</p>
                                        <p className="text-xs text-gray-500">{field.key}</p>
                                    </div>
                                    <div className="col-span-3">
                                        <Select
                                            value={mappings.find(m => m.facebook_field_name === field.key)?.lead_field_id?.toString() || ""}
                                            onValueChange={(value) => handleMappingChange(field.key, value ? parseInt(value) : null)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a field" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leadFields.map(leadField => (
                                                    <SelectItem key={leadField.id} value={leadField.id.toString()}>
                                                        {leadField.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={onClose} disabled={saving}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Mappings'}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
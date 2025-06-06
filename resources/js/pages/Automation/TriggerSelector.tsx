import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trigger } from '@/types/automation';
import {
    AlertTriangle,
    CheckCircle,
    Crown,
    Facebook,
    Filter,
    Info,
    RefreshCcw,
    Save,
    Search,
    Settings,
    UserPlus,
    Webhook,
    X,
    Zap,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

interface TriggerOption {
    id: string;
    icon: React.ReactNode;
    name: string;
    description: string;
    category: 'leads' | 'integrations';
    isPremium?: boolean;
    isNew?: boolean;
}

interface TriggerSelectorProps {
    selectedTrigger?: Trigger;
    onClose: () => void;
    onChange: (trigger: Trigger) => void;
}

const triggerOptions: TriggerOption[] = [
    // Lead Management Triggers
    {
        id: 'create_new_lead',
        icon: <UserPlus className="h-5 w-5" />,
        name: 'Create New Lead',
        description: 'Triggers when a new lead is created in the system',
        category: 'leads',
    },
    {
        id: 'update_lead_status',
        icon: <RefreshCcw className="h-5 w-5" />,
        name: 'Lead Status Updated',
        description: "Triggers when a lead's status is changed",
        category: 'leads',
    },

    // Integration Triggers
    {
        id: 'facebook_lead_form',
        icon: <Facebook className="h-5 w-5" />,
        name: 'Facebook Lead Form',
        description: 'Triggers when a new lead submits your Facebook lead form',
        category: 'integrations',
        isNew: true,
    },
    {
        id: 'inbound_webhook',
        icon: <Webhook className="h-5 w-5" />,
        name: 'Inbound Webhook',
        description: 'Triggers when data is received from an external system via webhook',
        category: 'integrations',
        isPremium: true,
    },
];

const leadStatuses = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal Sent' },
    { value: 'negotiation', label: 'In Negotiation' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' },
    { value: 'nurturing', label: 'Nurturing' },
];

const TriggerSelector: React.FC<TriggerSelectorProps> = ({ selectedTrigger, onClose, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'leads' | 'integrations'>('all');
    const [currentStep, setCurrentStep] = useState<'select' | 'configure'>('select');
    const [selectedTriggerOption, setSelectedTriggerOption] = useState<TriggerOption | null>(null);
    const [triggerConfig, setTriggerConfig] = useState<Partial<Trigger>>(selectedTrigger || { type: '', config: {} });
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Filter triggers based on search and category
    const filteredTriggers = useMemo(() => {
        return triggerOptions.filter((trigger) => {
            const matchesSearch =
                trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) || trigger.description.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory === 'all' || trigger.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory]);

    // Group triggers by category
    const groupedTriggers = useMemo(() => {
        return filteredTriggers.reduce(
            (acc, trigger) => {
                if (!acc[trigger.category]) {
                    acc[trigger.category] = [];
                }
                acc[trigger.category].push(trigger);
                return acc;
            },
            {} as Record<string, TriggerOption[]>,
        );
    }, [filteredTriggers]);

    const categoryTitles = {
        leads: 'Lead Management',
        integrations: 'External Integrations',
    };

    const categoryIcons = {
        leads: <UserPlus className="h-4 w-4" />,
        integrations: <Webhook className="h-4 w-4" />,
    };

    const handleTriggerSelect = useCallback((trigger: TriggerOption) => {
        setSelectedTriggerOption(trigger);
        setTriggerConfig((prev) => ({
            ...prev,
            type: trigger.id,
            config: getDefaultConfig(trigger.id),
        }));
        setCurrentStep('configure');
        setValidationErrors([]);
    }, []);

    const getDefaultConfig = (triggerId: string): Record<string, any> => {
        switch (triggerId) {
            case 'update_lead_status':
                return {
                    fromStatus: '',
                    toStatus: '',
                    includeAnyStatus: false,
                };
            case 'facebook_lead_form':
                return {
                    formId: '',
                    pageId: '',
                    accessToken: '',
                };
            case 'inbound_webhook':
                return {
                    webhookUrl: '',
                    secretKey: '',
                    verifySignature: true,
                };
            default:
                return {};
        }
    };

    const validateConfiguration = (): string[] => {
        const errors: string[] = [];

        if (!triggerConfig.type) {
            errors.push('Please select a trigger type');
            return errors;
        }

        switch (triggerConfig.type) {
            case 'update_lead_status':
                if (!triggerConfig.config?.includeAnyStatus) {
                    if (!triggerConfig.config?.fromStatus) {
                        errors.push('From status is required');
                    }
                    if (!triggerConfig.config?.toStatus) {
                        errors.push('To status is required');
                    }
                }
                break;

            case 'facebook_lead_form':
                if (!triggerConfig.config?.pageId) {
                    errors.push('Facebook Page ID is required');
                }
                if (!triggerConfig.config?.accessToken) {
                    errors.push('Access Token is required');
                }
                break;

            case 'inbound_webhook':
                if (!triggerConfig.config?.webhookUrl) {
                    errors.push('Webhook URL is required');
                }
                break;
        }

        return errors;
    };

    const handleSave = useCallback(() => {
        const errors = validateConfiguration();

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        onChange(triggerConfig as Trigger);
        onClose();
    }, [triggerConfig, onChange, onClose]);

    const handleBack = useCallback(() => {
        setCurrentStep('select');
        setSelectedTriggerOption(null);
        setValidationErrors([]);
    }, []);

    const renderTriggerCard = (trigger: TriggerOption) => (
        <Card
            key={trigger.id}
            className={`group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${selectedTrigger?.type === trigger.id ? 'bg-blue-50 ring-2 ring-blue-500' : 'hover:bg-gray-50'} ${trigger.isPremium ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50' : ''} `}
            onClick={() => handleTriggerSelect(trigger)}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div
                        className={`rounded-lg p-2 transition-colors group-hover:scale-110 ${trigger.isPremium ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} `}
                    >
                        {trigger.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-blue-700">{trigger.name}</h3>

                            {trigger.isPremium && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                    <Crown className="mr-1 h-3 w-3" />
                                    Premium
                                </Badge>
                            )}

                            {trigger.isNew && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    New
                                </Badge>
                            )}
                        </div>

                        <p className="text-sm leading-relaxed text-gray-600">{trigger.description}</p>
                    </div>

                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderConfiguration = () => {
        if (!selectedTriggerOption) return null;

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700">{selectedTriggerOption.icon}</div>
                    <div>
                        <h3 className="font-semibold text-blue-900">{selectedTriggerOption.name}</h3>
                        <p className="text-sm text-blue-700">{selectedTriggerOption.description}</p>
                    </div>
                </div>

                {/* Configuration Form */}
                <div className="space-y-4">
                    {triggerConfig.type === 'update_lead_status' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Status Change Configuration
                                </CardTitle>
                                <CardDescription>Configure which status changes should trigger this workflow</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="include-any-status"
                                        checked={triggerConfig.config?.includeAnyStatus || false}
                                        onCheckedChange={(checked) =>
                                            setTriggerConfig((prev) => ({
                                                ...prev,
                                                config: { ...prev.config, includeAnyStatus: checked },
                                            }))
                                        }
                                    />
                                    <Label htmlFor="include-any-status">Trigger on any status change</Label>
                                </div>

                                {!triggerConfig.config?.includeAnyStatus && (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="from-status">From Status</Label>
                                            <Select
                                                value={triggerConfig.config?.fromStatus}
                                                onValueChange={(value) =>
                                                    setTriggerConfig((prev) => ({
                                                        ...prev,
                                                        config: { ...prev.config, fromStatus: value },
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select from status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {leadStatuses.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            {status.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="to-status">To Status</Label>
                                            <Select
                                                value={triggerConfig.config?.toStatus || ''}
                                                onValueChange={(value) =>
                                                    setTriggerConfig((prev) => ({
                                                        ...prev,
                                                        config: { ...prev.config, toStatus: value },
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select new status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {leadStatuses.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            {status.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {triggerConfig.type === 'facebook_lead_form' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Facebook className="h-5 w-5" />
                                    Facebook Integration
                                </CardTitle>
                                <CardDescription>Connect your Facebook Lead Ads to trigger workflows</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="page-id">Facebook Page ID</Label>
                                    <Input
                                        id="page-id"
                                        placeholder="Enter your Facebook Page ID"
                                        value={triggerConfig.config?.pageId || ''}
                                        onChange={(e) =>
                                            setTriggerConfig((prev) => ({
                                                ...prev,
                                                config: { ...prev.config, pageId: e.target.value },
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="form-id">Lead Form ID (Optional)</Label>
                                    <Input
                                        id="form-id"
                                        placeholder="Leave blank to capture all forms"
                                        value={triggerConfig.config?.formId || ''}
                                        onChange={(e) =>
                                            setTriggerConfig((prev) => ({
                                                ...prev,
                                                config: { ...prev.config, formId: e.target.value },
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="access-token">Access Token</Label>
                                    <Input
                                        id="access-token"
                                        type="password"
                                        placeholder="Enter your Facebook Access Token"
                                        value={triggerConfig.config?.accessToken || ''}
                                        onChange={(e) =>
                                            setTriggerConfig((prev) => ({
                                                ...prev,
                                                config: { ...prev.config, accessToken: e.target.value },
                                            }))
                                        }
                                    />
                                </div>

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        You'll need to set up a Facebook App and get the necessary permissions.
                                        <a href="#" className="ml-1 text-blue-600 hover:underline">
                                            Learn more about Facebook Lead Ads integration
                                        </a>
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )}

                    {triggerConfig.type === 'inbound_webhook' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Webhook className="h-5 w-5" />
                                    Webhook Configuration
                                </CardTitle>
                                <CardDescription>Set up webhook endpoint to receive data from external systems</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="webhook-url">Webhook URL</Label>
                                    <Input
                                        id="webhook-url"
                                        placeholder="https://your-domain.com/webhook"
                                        value={triggerConfig.config?.webhookUrl || ''}
                                        onChange={(e) =>
                                            setTriggerConfig((prev) => ({
                                                ...prev,
                                                config: { ...prev.config, webhookUrl: e.target.value },
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="secret-key">Secret Key (Optional)</Label>
                                    <Input
                                        id="secret-key"
                                        type="password"
                                        placeholder="Enter a secret key for security"
                                        value={triggerConfig.config?.secretKey || ''}
                                        onChange={(e) =>
                                            setTriggerConfig((prev) => ({
                                                ...prev,
                                                config: { ...prev.config, secretKey: e.target.value },
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="verify-signature"
                                        checked={triggerConfig.config?.verifySignature || true}
                                        onCheckedChange={(checked) =>
                                            setTriggerConfig((prev) => ({
                                                ...prev,
                                                config: { ...prev.config, verifySignature: checked },
                                            }))
                                        }
                                    />
                                    <Label htmlFor="verify-signature">Verify webhook signature for security</Label>
                                </div>

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        This webhook URL will be generated after saving. Use it in your external systems to send data.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )}

                    {triggerConfig.type === 'create_new_lead' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    New Lead Trigger
                                </CardTitle>
                                <CardDescription>This trigger will activate whenever a new lead is created in your system</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        No additional configuration needed. This trigger will automatically activate when new leads are created.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="space-y-1">
                                <p className="font-medium">Please fix the following errors:</p>
                                <ul className="list-inside list-disc space-y-1">
                                    {validationErrors.map((error, index) => (
                                        <li key={index} className="text-sm">
                                            {error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-y-0 right-0 z-50 flex w-96 flex-col border-l bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                <div className="flex items-center gap-3">
                    {currentStep === 'configure' && (
                        <Button variant="ghost" size="icon" onClick={handleBack} className="hover:bg-blue-100">
                            ←
                        </Button>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Zap className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {currentStep === 'select' ? 'Select Trigger' : 'Configure Trigger'}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {currentStep === 'select' ? 'Choose what starts your workflow' : 'Set up your trigger settings'}
                            </p>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:bg-red-100 hover:text-red-600">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {currentStep === 'select' ? (
                    <>
                        {/* Search and Filter */}
                        <div className="border-b bg-gray-50 p-4">
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        type="search"
                                        placeholder="Search triggers..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <Tabs value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="all" className="text-xs">
                                            All
                                        </TabsTrigger>
                                        <TabsTrigger value="leads" className="text-xs">
                                            Leads
                                        </TabsTrigger>
                                        <TabsTrigger value="integrations" className="text-xs">
                                            Integrations
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>

                        {/* Trigger List */}
                        <ScrollArea className="flex-1">
                            <div className="space-y-4 p-4">
                                {Object.entries(groupedTriggers).map(([category, triggers]) => (
                                    <div key={category} className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            {categoryIcons[category as keyof typeof categoryIcons]}
                                            <span>{categoryTitles[category as keyof typeof categoryTitles]}</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {triggers.length}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">{triggers.map(renderTriggerCard)}</div>

                                        {Object.keys(groupedTriggers).length > 1 && <Separator className="my-4" />}
                                    </div>
                                ))}

                                {filteredTriggers.length === 0 && (
                                    <div className="py-8 text-center">
                                        <Filter className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                        <p className="font-medium text-gray-500">No triggers found</p>
                                        <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </>
                ) : (
                    <>
                        {/* Configuration Content */}
                        <ScrollArea className="flex-1">
                            <div className="p-4">{renderConfiguration()}</div>
                        </ScrollArea>

                        {/* Configuration Footer */}
                        <div className="border-t bg-gray-50 p-4">
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleBack} className="flex-1">
                                    Back
                                </Button>
                                <Button onClick={handleSave} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Trigger
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TriggerSelector;

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAutomationAPI } from '@/hooks/automation/useAutomationAPI';
import { Action } from '@/types/automation';
import { HTTP_METHODS, TIME_UNITS } from '@/utils/automation/constants';
import { createDefaultAction } from '@/utils/automation/workflowUtils';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Clock,
    Crown,
    Database,
    Eye,
    EyeOff,
    Filter,
    GitBranch,
    HelpCircle,
    Info,
    Loader2,
    Mail,
    MessageSquare,
    Save,
    Search,
    Sparkles,
    Tag,
    TestTube,
    User,
    UserPlus,
    Webhook,
    X,
    Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface ActionOption {
    id: string;
    icon: React.ReactNode;
    name: string;
    description: string;
    category: 'communication' | 'integrations' | 'flow_control' | 'lead_management' | 'data_manipulation';
    isPremium?: boolean;
    isNew?: boolean;
    complexity: 'simple' | 'medium' | 'advanced';
    estimatedTime?: string;
    requiredFields?: string[];
}

interface ActionSelectorProps {
    action?: Action;
    onClose: () => void;
    onChange: (action: Action) => void;
}

const actionOptions: ActionOption[] = [
    // Communication Actions
    {
        id: 'send_email',
        icon: <Mail className="h-5 w-5" />,
        name: 'Send Email',
        description: 'Send personalized emails with templates and dynamic content',
        category: 'communication',
        complexity: 'simple',
        estimatedTime: '2 min',
        requiredFields: ['subject', 'body'],
    },
    {
        id: 'send_whatsapp',
        icon: <MessageSquare className="h-5 w-5" />,
        name: 'Send WhatsApp',
        description: 'Send WhatsApp messages to leads instantly',
        category: 'communication',
        isNew: true,
        complexity: 'simple',
        estimatedTime: '1 min',
        requiredFields: ['message'],
    },

    // Integration Actions
    {
        id: 'send_webhook',
        icon: <Webhook className="h-5 w-5" />,
        name: 'Send Webhook',
        description: 'Send data to external systems via HTTP requests',
        category: 'integrations',
        complexity: 'medium',
        estimatedTime: '3 min',
        requiredFields: ['url', 'method'],
    },

    // Flow Control Actions
    {
        id: 'condition',
        icon: <GitBranch className="h-5 w-5" />,
        name: 'Condition',
        description: 'Create conditional logic with multiple branches',
        category: 'flow_control',
        complexity: 'medium',
        estimatedTime: '4 min',
        requiredFields: ['conditions'],
    },
    {
        id: 'delay',
        icon: <Clock className="h-5 w-5" />,
        name: 'Wait/Delay',
        description: 'Add time delays between actions',
        category: 'flow_control',
        complexity: 'simple',
        estimatedTime: '1 min',
        requiredFields: ['duration'],
    },

    // Lead Management Actions
    {
        id: 'add_tag',
        icon: <Tag className="h-5 w-5" />,
        name: 'Add Tag',
        description: 'Organize leads with custom tags',
        category: 'lead_management',
        complexity: 'simple',
        estimatedTime: '1 min',
        requiredFields: ['tags'],
    },
    {
        id: 'remove_tag',
        icon: <Tag className="h-5 w-5" />,
        name: 'Remove Tag',
        description: 'Remove specific tags from leads',
        category: 'lead_management',
        complexity: 'simple',
        estimatedTime: '1 min',
        requiredFields: ['tags'],
    },
    {
        id: 'assign_to_user',
        icon: <User className="h-5 w-5" />,
        name: 'Assign to User',
        description: 'Assign leads to specific team members',
        category: 'lead_management',
        complexity: 'simple',
        estimatedTime: '2 min',
        requiredFields: ['user_id'],
    },

    // Data Manipulation Actions
    {
        id: 'update_field',
        icon: <Zap className="h-5 w-5" />,
        name: 'Update Field',
        description: 'Update specific lead field values',
        category: 'data_manipulation',
        complexity: 'medium',
        estimatedTime: '2 min',
        requiredFields: ['field', 'value'],
    },
];

const categoryConfig = {
    communication: {
        title: 'Communication',
        icon: <Mail className="h-4 w-4" />,
    },
    integrations: {
        title: 'Integrations',
        icon: <Webhook className="h-4 w-4" />,
    },
    flow_control: {
        title: 'Flow Control',
        icon: <GitBranch className="h-4 w-4" />,
    },
    lead_management: {
        title: 'Lead Management',
        icon: <UserPlus className="h-4 w-4" />,
    },
    data_manipulation: {
        title: 'Data Operations',
        icon: <Database className="h-4 w-4" />,
    },
};

const ActionSelector: React.FC<ActionSelectorProps> = ({ action, onClose, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | keyof typeof categoryConfig>('all');
    const [currentStep, setCurrentStep] = useState<'select' | 'configure'>('select');
    const [selectedActionOption, setSelectedActionOption] = useState<ActionOption | null>(null);
    const [actionConfig, setActionConfig] = useState<Partial<Action>>(action || { type: '' });
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    const { fetchContactFields, fetchTags, testWebhook, loading } = useAutomationAPI();

    // Available options for dynamic fields
    const [contactFields, setContactFields] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);

    // Filter actions based on search and category
    const filteredActions = useMemo(() => {
        return actionOptions.filter((actionOption) => {
            const matchesSearch =
                actionOption.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                actionOption.description.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory === 'all' || actionOption.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory]);

    // Group actions by category
    const groupedActions = useMemo(() => {
        return filteredActions.reduce(
            (acc, actionOption) => {
                if (!acc[actionOption.category]) {
                    acc[actionOption.category] = [];
                }
                acc[actionOption.category].push(actionOption);
                return acc;
            },
            {} as Record<string, ActionOption[]>,
        );
    }, [filteredActions]);

    // Load dynamic data when needed
    useEffect(() => {
        if (currentStep === 'configure' && selectedActionOption) {
            if (['add_tag', 'remove_tag'].includes(selectedActionOption.id)) {
                fetchTags().then(setAvailableTags);
            }
            if (selectedActionOption.id === 'update_field') {
                fetchContactFields().then(setContactFields);
            }
        }
    }, [currentStep, selectedActionOption, fetchTags, fetchContactFields]);

    const handleActionSelect = useCallback((actionOption: ActionOption) => {
        setSelectedActionOption(actionOption);
        const newAction = createDefaultAction(actionOption.id);
        setActionConfig(newAction);
        setCurrentStep('configure');
        setValidationErrors([]);
    }, []);

    const getDefaultConfig = (actionId: string): Record<string, any> => {
        switch (actionId) {
            case 'send_email':
                return {
                    subject: '',
                    body: '',
                    to: '',
                    template_id: '',
                    send_copy_to: [],
                };
            case 'send_whatsapp':
                return {
                    message: '',
                    phone: '',
                    template_id: '',
                };
            case 'send_webhook':
                return {
                    url: '',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: '',
                    timeout: 30,
                    retry_count: 3,
                };
            case 'condition':
                return {
                    conditions: [],
                    operator: 'AND',
                    yesActions: [],
                    noActions: [],
                };
            case 'delay':
                return {
                    duration: 5,
                    unit: 'minutes',
                };
            case 'add_tag':
            case 'remove_tag':
                return {
                    tags: [],
                };
            case 'assign_to_user':
                return {
                    user_id: 0,
                    notify_user: true,
                };
            case 'update_field':
                return {
                    field: '',
                    value: '',
                };
            default:
                return {};
        }
    };

    const validateConfiguration = (): string[] => {
        const errors: string[] = [];

        if (!actionConfig.type) {
            errors.push('Please select an action type');
            return errors;
        }

        const actionOption = actionOptions.find((opt) => opt.id === actionConfig.type);
        if (!actionOption) return errors;

        // Check required fields
        actionOption.requiredFields?.forEach((field) => {
            const value = actionConfig[field as keyof Action];
            if (!value || (Array.isArray(value) && value.length === 0)) {
                errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
            }
        });

        // Specific validations
        switch (actionConfig.type) {
            case 'send_webhook':
                if (actionConfig.url && !isValidUrl(actionConfig.url)) {
                    errors.push('Please enter a valid URL');
                }
                break;
            case 'condition':
                if (!actionConfig.conditions || actionConfig.conditions.length === 0) {
                    errors.push('At least one condition is required');
                }
                break;
            case 'delay':
                if (actionConfig.duration && actionConfig.duration <= 0) {
                    errors.push('Duration must be greater than 0');
                }
                break;
        }

        return errors;
    };

    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSave = useCallback(() => {
        const errors = validateConfiguration();

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        onChange(actionConfig as Action);
        onClose();
    }, [actionConfig, onChange, onClose]);

    const handleBack = useCallback(() => {
        setCurrentStep('select');
        setSelectedActionOption(null);
        setValidationErrors([]);
        setShowAdvanced(false);
    }, []);

    const handleTestWebhook = useCallback(async () => {
        if (actionConfig.type === 'send_webhook' && actionConfig.url) {
            setIsTesting(true);
            try {
                const success = await testWebhook(actionConfig.url, actionConfig.method || 'POST', actionConfig.headers || {}, actionConfig.body);
                if (success) {
                    alert('Webhook test successful!');
                } else {
                    alert('Webhook test failed. Please check your configuration.');
                }
            } catch (error) {
                alert('Webhook test failed. Please check your configuration.');
            } finally {
                setIsTesting(false);
            }
        }
    }, [actionConfig, testWebhook]);

    const renderActionCard = (actionOption: ActionOption) => (
        <Card
            key={actionOption.id}
            className={`group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                action?.type === actionOption.id ? 'bg-blue-50 ring-2 ring-blue-500' : 'hover:border-blue-300'
            }`}
            onClick={() => handleActionSelect(actionOption)}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div
                        className={`rounded-lg p-2 transition-colors group-hover:scale-110 ${
                            actionOption.isPremium ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}
                    >
                        {actionOption.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-blue-700">{actionOption.name}</h3>

                            {actionOption.isPremium && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                    <Crown className="mr-1 h-3 w-3" />
                                    Premium
                                </Badge>
                            )}

                            {actionOption.isNew && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    <Sparkles className="mr-1 h-3 w-3" />
                                    New
                                </Badge>
                            )}
                        </div>

                        <p className="mb-2 text-sm leading-relaxed text-gray-600">{actionOption.description}</p>

                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={`text-xs ${
                                    actionOption.complexity === 'simple'
                                        ? 'border-green-200 bg-green-50 text-green-700'
                                        : actionOption.complexity === 'medium'
                                          ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                          : 'border-red-200 bg-red-50 text-red-700'
                                }`}
                            >
                                {actionOption.complexity}
                            </Badge>
                            {actionOption.estimatedTime && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    {actionOption.estimatedTime}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderConfiguration = () => {
        if (!selectedActionOption) return null;

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700">{selectedActionOption.icon}</div>
                    <div>
                        <h3 className="font-semibold text-blue-900">{selectedActionOption.name}</h3>
                        <p className="text-sm text-blue-700">{selectedActionOption.description}</p>
                    </div>
                </div>

                {/* Configuration Form */}
                <div className="space-y-4">
                    {actionConfig.type === 'send_email' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Email Configuration
                                </CardTitle>
                                <CardDescription>Set up your email content and recipients</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email-to">To (Optional)</Label>
                                    <Input
                                        id="email-to"
                                        placeholder="recipient@example.com or leave empty for lead email"
                                        value={actionConfig.to || ''}
                                        onChange={(e) =>
                                            setActionConfig((prev) => ({
                                                ...prev,
                                                to: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email-subject">Subject *</Label>
                                    <Input
                                        id="email-subject"
                                        placeholder="Enter email subject..."
                                        value={actionConfig.subject || ''}
                                        onChange={(e) =>
                                            setActionConfig((prev) => ({
                                                ...prev,
                                                subject: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email-body">Message *</Label>
                                    <Textarea
                                        id="email-body"
                                        placeholder="Enter your email content..."
                                        rows={5}
                                        value={actionConfig.body || ''}
                                        onChange={(e) =>
                                            setActionConfig((prev) => ({
                                                ...prev,
                                                body: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        You can use variables like {'{'}
                                        {'{'}.name{'}'}
                                        {'}'}, {'{'}
                                        {'{'}.email{'}'}
                                        {'}'}, {'{'}
                                        {'{'}.phone{'}'}
                                        {'}'} to personalize your emails.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )}

                    {actionConfig.type === 'send_whatsapp' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    WhatsApp Configuration
                                </CardTitle>
                                <CardDescription>Set up your WhatsApp message</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="whatsapp-phone">Phone Number (Optional)</Label>
                                    <Input
                                        id="whatsapp-phone"
                                        placeholder="+1234567890 or leave empty for lead phone"
                                        value={actionConfig.phone || ''}
                                        onChange={(e) =>
                                            setActionConfig((prev) => ({
                                                ...prev,
                                                phone: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="whatsapp-message">Message *</Label>
                                    <Textarea
                                        id="whatsapp-message"
                                        placeholder="Enter your WhatsApp message..."
                                        rows={4}
                                        value={actionConfig.message || ''}
                                        onChange={(e) =>
                                            setActionConfig((prev) => ({
                                                ...prev,
                                                message: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>Keep messages under 1000 characters for better delivery rates.</AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )}

                    {actionConfig.type === 'send_webhook' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Webhook className="h-5 w-5" />
                                    Webhook Configuration
                                </CardTitle>
                                <CardDescription>Send data to external systems</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="webhook-url">URL *</Label>
                                    <Input
                                        id="webhook-url"
                                        placeholder="https://api.example.com/webhook"
                                        value={actionConfig.url || ''}
                                        onChange={(e) =>
                                            setActionConfig((prev) => ({
                                                ...prev,
                                                url: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="webhook-method">HTTP Method *</Label>
                                    <Select
                                        value={actionConfig.method || 'POST'}
                                        onValueChange={(value) =>
                                            setActionConfig((prev) => ({
                                                ...prev,
                                                method: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {HTTP_METHODS.map((method) => (
                                                <SelectItem key={method} value={method}>
                                                    {method}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="webhook-body">Request Body</Label>
                                    <Textarea
                                        id="webhook-body"
                                        placeholder='{"lead_id": {{.id}}, "name": "{{.name}}"}'
                                        rows={4}
                                        value={actionConfig.body || ''}
                                        onChange={(e) =>
                                            setActionConfig((prev) => ({
                                                ...prev,
                                                body: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
                                        {showAdvanced ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                        {showAdvanced ? 'Hide' : 'Show'} Advanced
                                    </Button>

                                    {actionConfig.url && (
                                        <Button variant="outline" size="sm" onClick={handleTestWebhook} disabled={isTesting}>
                                            {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
                                            Test Webhook
                                        </Button>
                                    )}
                                </div>

                                {showAdvanced && (
                                    <div className="space-y-4 border-t pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="webhook-timeout">Timeout (seconds)</Label>
                                                <Input
                                                    id="webhook-timeout"
                                                    type="number"
                                                    min="5"
                                                    max="300"
                                                    value={actionConfig.timeout || 30}
                                                    onChange={(e) =>
                                                        setActionConfig((prev) => ({
                                                            ...prev,
                                                            timeout: parseInt(e.target.value),
                                                        }))
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="webhook-retries">Retry Count</Label>
                                                <Input
                                                    id="webhook-retries"
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    value={actionConfig.retry_count || 3}
                                                    onChange={(e) =>
                                                        setActionConfig((prev) => ({
                                                            ...prev,
                                                            retry_count: parseInt(e.target.value),
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {actionConfig.type === 'delay' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Delay Configuration
                                </CardTitle>
                                <CardDescription>Add a time delay before the next action</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="delay-duration">Duration *</Label>
                                        <Input
                                            id="delay-duration"
                                            type="number"
                                            min="1"
                                            placeholder="5"
                                            value={actionConfig.duration || ''}
                                            onChange={(e) =>
                                                setActionConfig((prev) => ({
                                                    ...prev,
                                                    duration: parseInt(e.target.value),
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="delay-unit">Unit</Label>
                                        <Select
                                            value={actionConfig.unit || 'minutes'}
                                            onValueChange={(value) =>
                                                setActionConfig((prev) => ({
                                                    ...prev,
                                                    unit: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TIME_UNITS.map((unit) => (
                                                    <SelectItem key={unit.value} value={unit.value}>
                                                        {unit.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        The workflow will pause for the specified duration before continuing to the next action.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )}

                    {(actionConfig.type === 'add_tag' || actionConfig.type === 'remove_tag') && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Tag className="h-5 w-5" />
                                    Tag Configuration
                                </CardTitle>
                                <CardDescription>
                                    {actionConfig.type === 'add_tag' ? 'Add tags to organize leads' : 'Remove specific tags from leads'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tag-input">Tags *</Label>
                                    <Input
                                        id="tag-input"
                                        placeholder="Enter tags separated by commas"
                                        value={actionConfig.tags?.join(', ') || ''}
                                        onChange={(e) =>
                                            setActionConfig((prev) => ({
                                                ...prev,
                                                tags: e.target.value
                                                    .split(',')
                                                    .map((tag) => tag.trim())
                                                    .filter(Boolean),
                                            }))
                                        }
                                    />
                                </div>

                                {availableTags.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Available Tags</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableTags.slice(0, 10).map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="outline"
                                                    className="cursor-pointer hover:bg-blue-50"
                                                    onClick={() => {
                                                        const currentTags = actionConfig.tags || [];
                                                        if (!currentTags.includes(tag)) {
                                                            setActionConfig((prev) => ({
                                                                ...prev,
                                                                tags: [...currentTags, tag],
                                                            }));
                                                        }
                                                    }}
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {actionConfig.type === 'condition' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GitBranch className="h-5 w-5" />
                                    Condition Configuration
                                </CardTitle>
                                <CardDescription>Create conditional logic for your workflow</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Alert>
                                    <HelpCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Conditional logic builder coming soon. This will allow you to create complex if/then/else logic.
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
        <div className="fixed inset-y-0 right-0 z-50 flex w-[32rem] max-w-[90vw] flex-col border-l bg-white shadow-2xl">
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                <div className="flex items-center gap-3">
                    {currentStep === 'configure' && (
                        <Button variant="ghost" size="icon" onClick={handleBack} className="hover:bg-blue-100">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Zap className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">{currentStep === 'select' ? 'Select Action' : 'Configure Action'}</h2>
                            <p className="text-sm text-gray-600">
                                {currentStep === 'select' ? 'Choose what happens in this step' : 'Set up your action settings'}
                            </p>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:bg-red-100 hover:text-red-600">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Content with ScrollArea */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    {currentStep === 'select' ? (
                        <>
                            {/* Search and Filter */}
                            <div className="border-b bg-gray-50 p-4">
                                <div className="space-y-2">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                        <Input
                                            type="search"
                                            placeholder="Search actions..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-8 pl-10"
                                        />
                                    </div>

                                    {/* Compact Category List */}
                                    <div className="space-y-1">
                                        {/* All Actions */}
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors ${
                                                selectedCategory === 'all'
                                                    ? 'border border-blue-200 bg-blue-100 text-blue-700'
                                                    : 'border border-transparent hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Filter className="h-3 w-3" />
                                                <span className="font-medium">All Actions</span>
                                            </div>
                                            <Badge variant="outline" className="h-5 text-xs">
                                                {actionOptions.length}
                                            </Badge>
                                        </button>

                                        {/* Category List */}
                                        {Object.entries(categoryConfig).map(([key, config]) => {
                                            const count = actionOptions.filter((a) => a.category === key).length;
                                            const isSelected = selectedCategory === key;

                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => setSelectedCategory(key as any)}
                                                    className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors ${
                                                        isSelected
                                                            ? 'border border-blue-200 bg-blue-100 text-blue-700'
                                                            : 'border border-transparent hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {config.icon}
                                                        <span className="font-medium">{config.title}</span>
                                                    </div>
                                                    <Badge variant="outline" className="h-5 text-xs">
                                                        {count}
                                                    </Badge>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Action List */}
                            <div className="space-y-4 p-4">
                                {Object.entries(groupedActions).map(([category, actions]) => (
                                    <div key={category} className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            {categoryConfig[category as keyof typeof categoryConfig].icon}
                                            <span>{categoryConfig[category as keyof typeof categoryConfig].title}</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {actions.length}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">{actions.map(renderActionCard)}</div>

                                        {Object.keys(groupedActions).length > 1 && <Separator className="my-4" />}
                                    </div>
                                ))}

                                {filteredActions.length === 0 && (
                                    <div className="py-8 text-center">
                                        <Filter className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                        <p className="font-medium text-gray-500">No actions found</p>
                                        <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="p-4">{renderConfiguration()}</div>
                    )}
                </ScrollArea>
            </div>

            {/* Configuration Footer - Only show when configuring */}
            {currentStep === 'configure' && (
                <div className="flex-shrink-0 border-t bg-gray-50 p-4">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleBack} className="flex-1">
                            Back
                        </Button>
                        <Button onClick={handleSave} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                            <Save className="mr-2 h-4 w-4" />
                            Save Action
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionSelector;

import React from 'react';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface StepConfig {
    step_type: string;
    config: Record<string, any>;
    error_handling?: {
        max_retries?: number;
        retry_delay?: number;
        on_error?: 'continue' | 'fail_workflow';
    };
    field_mapping?: Record<string, string>;
}

interface StepConfigProps {
    config: StepConfig;
    onUpdate: (config: StepConfig) => void;
}

const STEP_TYPES = {
    action: {
        label: 'Action',
        types: {
            http_request: 'HTTP Request',
            send_email: 'Send Email',
            update_crm: 'Update CRM',
        },
    },
    condition: {
        label: 'Condition',
        operators: {
            equals: 'Equals',
            not_equals: 'Not Equals',
            greater_than: 'Greater Than',
            less_than: 'Less Than',
            contains: 'Contains',
            not_contains: 'Not Contains',
        },
    },
    delay: {
        label: 'Delay',
        units: {
            minutes: 'Minutes',
            hours: 'Hours',
            days: 'Days',
        },
    },
    data_mapper: {
        label: 'Data Mapper',
    },
};

const StepConfig: React.FC<StepConfigProps> = ({ config, onUpdate }) => {
    const handleConfigChange = (key: string, value: any) => {
        onUpdate({
            ...config,
            config: {
                ...config.config,
                [key]: value,
            },
        });
    };

    const handleErrorHandlingChange = (key: string, value: any) => {
        onUpdate({
            ...config,
            error_handling: {
                ...config.error_handling,
                [key]: value,
            },
        });
    };

    const handleFieldMappingChange = (targetPath: string, sourcePath: string) => {
        onUpdate({
            ...config,
            field_mapping: {
                ...config.field_mapping,
                [targetPath]: sourcePath,
            },
        });
    };

    const renderActionConfig = () => {
        const actionType = config.config.action_type;

        switch (actionType) {
            case 'http_request':
                return (
                    <div className="space-y-4">
                        <Input
                            value={config.config.url || ''}
                            onChange={(e) => handleConfigChange('url', e.target.value)}
                            placeholder="URL"
                        />
                        <Select
                            value={config.config.method || 'GET'}
                            onValueChange={(value) => handleConfigChange('method', value)}
                            options={[
                                { value: 'GET', label: 'GET' },
                                { value: 'POST', label: 'POST' },
                                { value: 'PUT', label: 'PUT' },
                                { value: 'DELETE', label: 'DELETE' },
                            ]}
                        />
                    </div>
                );

            case 'send_email':
                return (
                    <div className="space-y-4">
                        <Input
                            value={config.config.to || ''}
                            onChange={(e) => handleConfigChange('to', e.target.value)}
                            placeholder="To Email"
                        />
                        <Input
                            value={config.config.subject || ''}
                            onChange={(e) => handleConfigChange('subject', e.target.value)}
                            placeholder="Subject"
                        />
                        <Select
                            value={config.config.template_id || ''}
                            onValueChange={(value) => handleConfigChange('template_id', value)}
                            options={[
                                { value: 'template1', label: 'Welcome Email' },
                                { value: 'template2', label: 'Follow-up Email' },
                            ]}
                        />
                    </div>
                );

            case 'update_crm':
                return (
                    <div className="space-y-4">
                        <Select
                            value={config.config.entity_type || ''}
                            onValueChange={(value) => handleConfigChange('entity_type', value)}
                            options={[
                                { value: 'contact', label: 'Contact' },
                                { value: 'deal', label: 'Deal' },
                                { value: 'company', label: 'Company' },
                            ]}
                        />
                        <Select
                            value={config.config.action || ''}
                            onValueChange={(value) => handleConfigChange('action', value)}
                            options={[
                                { value: 'create', label: 'Create' },
                                { value: 'update', label: 'Update' },
                                { value: 'delete', label: 'Delete' },
                            ]}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    const renderConditionConfig = () => (
        <div className="space-y-4">
            <Input
                value={config.config.field || ''}
                onChange={(e) => handleConfigChange('field', e.target.value)}
                placeholder="Field Path (e.g., trigger_data.email)"
            />
            <Select
                value={config.config.operator || ''}
                onValueChange={(value) => handleConfigChange('operator', value)}
                options={Object.entries(STEP_TYPES.condition.operators).map(([value, label]) => ({
                    value,
                    label: label as string,
                }))}
            />
            <Input
                value={config.config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
                placeholder="Comparison Value"
            />
        </div>
    );

    const renderDelayConfig = () => (
        <div className="space-y-4">
            <Input
                type="number"
                value={config.config.amount || ''}
                onChange={(e) => handleConfigChange('amount', parseInt(e.target.value))}
                placeholder="Delay Amount"
            />
            <Select
                value={config.config.unit || ''}
                onValueChange={(value) => handleConfigChange('unit', value)}
                options={Object.entries(STEP_TYPES.delay.units).map(([value, label]) => ({
                    value,
                    label: label as string,
                }))}
            />
        </div>
    );

    const renderDataMapperConfig = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input
                    value={config.config.target_path || ''}
                    onChange={(e) => handleConfigChange('target_path', e.target.value)}
                    placeholder="Target Path"
                />
                <Input
                    value={config.config.source_path || ''}
                    onChange={(e) => handleConfigChange('source_path', e.target.value)}
                    placeholder="Source Path"
                />
            </div>
            <button
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => handleFieldMappingChange(
                    config.config.target_path,
                    config.config.source_path
                )}
            >
                Add Mapping
            </button>
        </div>
    );

    const renderErrorHandling = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Enable Error Handling</Label>
                <Switch
                    checked={!!config.error_handling}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            handleErrorHandlingChange('max_retries', 3);
                        } else {
                            onUpdate({ ...config, error_handling: undefined });
                        }
                    }}
                />
            </div>

            {config.error_handling && (
                <>
                    <div className="space-y-2">
                        <Label>Max Retries</Label>
                        <Input
                            type="number"
                            value={config.error_handling.max_retries || 0}
                            onChange={(e) => handleErrorHandlingChange('max_retries', parseInt(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Retry Delay (seconds)</Label>
                        <Input
                            type="number"
                            value={config.error_handling.retry_delay || 0}
                            onChange={(e) => handleErrorHandlingChange('retry_delay', parseInt(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>On Error</Label>
                        <Select
                            value={config.error_handling.on_error || 'fail_workflow'}
                            onValueChange={(value) => handleErrorHandlingChange('on_error', value)}
                            options={[
                                { value: 'fail_workflow', label: 'Fail Workflow' },
                                { value: 'continue', label: 'Continue to Next Step' },
                            ]}
                        />
                    </div>
                </>
            )}
        </div>
    );

    return (
        <Card className="p-6">
            <Tabs defaultValue="config">
                <TabsList>
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                    <TabsTrigger value="error_handling">Error Handling</TabsTrigger>
                </TabsList>

                <TabsContent value="config" className="space-y-6">
                    <Select
                        value={config.step_type}
                        onValueChange={(value) => onUpdate({ ...config, step_type: value })}
                        options={Object.entries(STEP_TYPES).map(([value, { label }]) => ({
                            value,
                            label,
                        }))}
                    />

                    {config.step_type === 'action' && (
                        <Select
                            value={config.config.action_type || ''}
                            onValueChange={(value) => handleConfigChange('action_type', value)}
                            options={Object.entries(STEP_TYPES.action.types).map(([value, label]) => ({
                                value,
                                label: label as string,
                            }))}
                        />
                    )}

                    {config.step_type === 'action' && renderActionConfig()}
                    {config.step_type === 'condition' && renderConditionConfig()}
                    {config.step_type === 'delay' && renderDelayConfig()}
                    {config.step_type === 'data_mapper' && renderDataMapperConfig()}
                </TabsContent>

                <TabsContent value="error_handling">
                    {renderErrorHandling()}
                </TabsContent>
            </Tabs>
        </Card>
    );
};

export default StepConfig; 
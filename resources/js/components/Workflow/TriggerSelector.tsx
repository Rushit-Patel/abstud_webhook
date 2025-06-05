import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TriggerConfig {
    [key: string]: any;
}

interface Trigger {
    type: string;
    config?: TriggerConfig;
}

interface TriggerSelectorProps {
    selectedTrigger?: Trigger;
    onClose: () => void;
    onChange: (trigger: Trigger) => void;
}

const TRIGGER_TYPES = {
    facebook_lead_form: {
        label: 'Facebook Lead Form',
        icon: 'facebook',
        configFields: ['page_id', 'form_ids'],
    },
    webhook: {
        label: 'Webhook',
        icon: 'webhook',
        configFields: ['endpoint_url', 'secret_key'],
    },
    scheduled: {
        label: 'Scheduled',
        icon: 'calendar',
        configFields: ['schedule_type', 'cron_expression', 'interval'],
    },
    crm_event: {
        label: 'CRM Event',
        icon: 'database',
        configFields: ['event_type', 'entity_type'],
    },
    email_event: {
        label: 'Email Event',
        icon: 'mail',
        configFields: ['event_type', 'template_id'],
    },
};

const TriggerSelector: React.FC<TriggerSelectorProps> = ({ selectedTrigger, onClose, onChange }) => {
    const [activeTab, setActiveTab] = useState(selectedTrigger?.type || 'facebook_lead_form');

    const handleTypeChange = (type: string) => {
        setActiveTab(type);
        onChange({
            type,
            config: {},
        });
    };

    const handleConfigChange = (key: string, value: any) => {
        onChange({
            type: activeTab,
            config: {
                ...(selectedTrigger?.config || {}),
                [key]: value,
            },
        });
    };

    const renderConfigFields = () => {
        const type = activeTab;
        const config = selectedTrigger?.config || {};

        switch (type) {
            case 'facebook_lead_form':
                return (
                    <div className="space-y-4">
                        <Select
                            value={config.page_id}
                            onValueChange={(value) => handleConfigChange('page_id', value)}
                            options={[
                                { value: 'page1', label: 'Page 1' },
                                { value: 'page2', label: 'Page 2' },
                            ]}
                            placeholder="Select Facebook Page"
                        />
                        <Select
                            value={config.form_ids}
                            onValueChange={(value) => handleConfigChange('form_ids', value)}
                            options={[
                                { value: 'form1', label: 'Form 1' },
                                { value: 'form2', label: 'Form 2' },
                            ]}
                            placeholder="Select Lead Form"
                        />
                    </div>
                );

            case 'webhook':
                return (
                    <div className="space-y-4">
                        <Input
                            value={config.endpoint_url || ''}
                            onChange={(e) => handleConfigChange('endpoint_url', e.target.value)}
                            placeholder="Webhook URL"
                        />
                        <Input
                            value={config.secret_key || ''}
                            onChange={(e) => handleConfigChange('secret_key', e.target.value)}
                            placeholder="Secret Key"
                        />
                    </div>
                );

            case 'scheduled':
                return (
                    <div className="space-y-4">
                        <Select
                            value={config.schedule_type}
                            onValueChange={(value) => handleConfigChange('schedule_type', value)}
                            options={[
                                { value: 'cron', label: 'Cron Expression' },
                                { value: 'interval', label: 'Fixed Interval' },
                            ]}
                            placeholder="Schedule Type"
                        />
                        {config.schedule_type === 'cron' ? (
                            <Input
                                value={config.cron_expression || ''}
                                onChange={(e) => handleConfigChange('cron_expression', e.target.value)}
                                placeholder="Cron Expression (e.g., * * * * *)"
                            />
                        ) : (
                            <div className="flex space-x-2">
                                <Input
                                    type="number"
                                    value={config.interval || ''}
                                    onChange={(e) => handleConfigChange('interval', e.target.value)}
                                    placeholder="Interval"
                                />
                                <Select
                                    value={config.interval_unit}
                                    onValueChange={(value) => handleConfigChange('interval_unit', value)}
                                    options={[
                                        { value: 'minutes', label: 'Minutes' },
                                        { value: 'hours', label: 'Hours' },
                                        { value: 'days', label: 'Days' },
                                    ]}
                                />
                            </div>
                        )}
                    </div>
                );

            case 'crm_event':
                return (
                    <div className="space-y-4">
                        <Select
                            value={config.event_type}
                            onValueChange={(value) => handleConfigChange('event_type', value)}
                            options={[
                                { value: 'created', label: 'Created' },
                                { value: 'updated', label: 'Updated' },
                                { value: 'deleted', label: 'Deleted' },
                            ]}
                            placeholder="Event Type"
                        />
                        <Select
                            value={config.entity_type}
                            onValueChange={(value) => handleConfigChange('entity_type', value)}
                            options={[
                                { value: 'contact', label: 'Contact' },
                                { value: 'deal', label: 'Deal' },
                                { value: 'company', label: 'Company' },
                            ]}
                            placeholder="Entity Type"
                        />
                    </div>
                );

            case 'email_event':
                return (
                    <div className="space-y-4">
                        <Select
                            value={config.event_type}
                            onValueChange={(value) => handleConfigChange('event_type', value)}
                            options={[
                                { value: 'opened', label: 'Opened' },
                                { value: 'clicked', label: 'Clicked' },
                                { value: 'bounced', label: 'Bounced' },
                            ]}
                            placeholder="Event Type"
                        />
                        <Select
                            value={config.template_id}
                            onValueChange={(value) => handleConfigChange('template_id', value)}
                            options={[
                                { value: 'template1', label: 'Welcome Email' },
                                { value: 'template2', label: 'Follow-up Email' },
                            ]}
                            placeholder="Email Template"
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Card className="p-6">
            <Tabs value={activeTab} onValueChange={handleTypeChange}>
                <TabsList className="grid grid-cols-5 gap-4">
                    {Object.entries(TRIGGER_TYPES).map(([type, { label, icon }]) => (
                        <TabsTrigger
                            key={type}
                            value={type}
                            className="flex items-center space-x-2"
                        >
                            <i className={`icon-${icon}`} />
                            <span>{label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="mt-6">
                    {renderConfigFields()}
                </div>
            </Tabs>
        </Card>
    );
};

export default TriggerSelector; 
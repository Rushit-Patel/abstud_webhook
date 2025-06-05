// src/components/automation/ActionSelector.tsx
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Action, Condition } from '@/types/automation';
import axios from 'axios';
import { Clock, Database, FileSpreadsheet, GitBranch, Mail, MessageSquare, Send, Tag, User, UserPlus, Webhook, X } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import ConditionEditor from './ConditionEditor';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActionOption {
    id: string;
    icon: React.ReactNode;
    name: string;
    description: string;
    category: 'communication' | 'integrations' | 'flow_control';
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
        icon: <Mail className="w-5 h-5" />,
        name: 'Send Email',
        description: 'Send a personalized email to the lead',
        category: 'communication'
    },
    {
        id: 'send_whatsapp',
        icon: <MessageSquare className="w-5 h-5" />,
        name: 'Send WhatsApp',
        description: 'Send a WhatsApp message to the lead',
        category: 'communication'
    },

    // Integration Actions
    {
        id: 'send_webhook',
        icon: <Webhook className="w-5 h-5" />,
        name: 'Send Webhook',
        description: 'Send data to an external system via webhook',
        category: 'integrations'
    },

    // Flow Control Actions
    {
        id: 'condition',
        icon: <GitBranch className="w-5 h-5" />,
        name: 'Condition',
        description: 'Split workflow based on conditions with multiple branches',
        category: 'flow_control'
    }
];

const ActionSelector: React.FC<ActionSelectorProps> = ({ action, onClose, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredActions = actionOptions.filter(action =>
        action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedActions = filteredActions.reduce((acc, action) => {
        if (!acc[action.category]) {
            acc[action.category] = [];
        }
        acc[action.category].push(action);
        return acc;
    }, {} as Record<string, ActionOption[]>);

    const handleActionSelect = (actionId: string) => {
        const newAction: Action = { type: actionId };
        
        // Add default configuration based on action type
        if (actionId === 'condition') {
            newAction.conditions = [];
            newAction.yesActions = [];
            newAction.noActions = [];
        } else if (actionId === 'send_webhook') {
            newAction.webhookUrl = '';
            newAction.method = 'POST';
            newAction.headers = {};
            newAction.body = {};
        } else if (actionId === 'send_email') {
            newAction.template = '';
            newAction.subject = '';
            newAction.to = '';
        } else if (actionId === 'send_whatsapp') {
            newAction.template = '';
            newAction.to = '';
        }

        onChange(newAction);
        onClose();
    };

    const categoryTitles = {
        communication: 'Communication',
        integrations: 'Integrations',
        flow_control: 'Flow Control'
    };

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l shadow-lg">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold">Select Action</h2>
                        <p className="text-sm text-gray-500">
                            Choose what happens in this step
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b">
                    <Input
                        type="search"
                        placeholder="Search actions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Action List */}
                <ScrollArea className="flex-1">
                    <div className="p-4">
                        {Object.entries(groupedActions).map(([category, actions]) => (
                            <div key={category} className="mb-6 last:mb-0">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">
                                    {categoryTitles[category as keyof typeof categoryTitles]}
                                </h3>
                                <div className="space-y-2">
                                    {actions.map((action) => (
                                        <button
                                            key={action.id}
                                            onClick={() => handleActionSelect(action.id)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <div className="text-gray-600">
                                                {action.icon}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium">{action.name}</div>
                                                <div className="text-sm text-gray-500">{action.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default ActionSelector;

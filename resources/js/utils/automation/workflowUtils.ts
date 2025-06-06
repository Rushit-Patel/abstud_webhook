import { Action, Workflow, Trigger } from '@/types/automation';
import { ACTION_TYPES } from './constants';

export const createDefaultAction = (actionType: string): Action => {
    const baseAction = { 
        type: actionType,
        enabled: true,
    };
    
    switch (actionType) {
        case ACTION_TYPES.SEND_EMAIL:
            return {
                ...baseAction,
                type: 'send_email',
                subject: '',
                body: '',
            };
        case ACTION_TYPES.SEND_WHATSAPP:
            return {
                ...baseAction,
                type: 'send_whatsapp',
                message: '',
            };
        case ACTION_TYPES.SEND_WEBHOOK:
            return {
                ...baseAction,
                type: 'send_webhook',
                url: '',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30,
                retry_count: 3,
            };
        case ACTION_TYPES.CONDITION:
            return {
                ...baseAction,
                type: 'condition',
                conditions: [],
                operator: 'AND',
                yesActions: [],
                noActions: [],
            };
        case ACTION_TYPES.DELAY:
            return {
                ...baseAction,
                type: 'delay',
                duration: 5,
                unit: 'minutes',
            };
        case ACTION_TYPES.ADD_TAG:
            return {
                ...baseAction,
                type: 'add_tag',
                tags: [],
            };
        case ACTION_TYPES.REMOVE_TAG:
            return {
                ...baseAction,
                type: 'remove_tag',
                tags: [],
            };
        default:
            return baseAction as Action;
    }
};

export const createNewWorkflow = (): Workflow => ({
    id: 0,
    name: '',
    description: '',
    is_active: false,
    trigger: { type: '' },
    actions: [],
    tags: [],
});

export const duplicateWorkflow = (workflow: Workflow): Workflow => ({
    ...workflow,
    id: 0,
    name: `${workflow.name} (Copy)`,
    is_active: false,
    created_at: undefined,
    updated_at: undefined,
});

export const generateWorkflowSummary = (workflow: Workflow): string => {
    const triggerName = workflow.trigger.name || workflow.trigger.type;
    const actionCount = workflow.actions.length;
    return `${triggerName} → ${actionCount} action${actionCount !== 1 ? 's' : ''}`;
};

export const calculateWorkflowComplexity = (workflow: Workflow): 'simple' | 'medium' | 'complex' => {
    const actionCount = workflow.actions.length;
    const hasConditions = workflow.actions.some(action => action.type === 'condition');
    
    if (actionCount <= 2 && !hasConditions) return 'simple';
    if (actionCount <= 5 || hasConditions) return 'medium';
    return 'complex';
};
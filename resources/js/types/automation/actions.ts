import { Condition } from './conditions'; // Import instead of defining

export interface BaseAction {
    id?: string;
    type: string;
    name?: string;
    enabled?: boolean;
    delay?: number; // in minutes
}

export interface EmailAction extends BaseAction {
    type: 'send_email';
    to?: string;
    subject: string;
    body: string;
    template_id?: string;
    attachments?: string[];
    send_copy_to?: string[];
}

export interface WhatsAppAction extends BaseAction {
    type: 'send_whatsapp';
    phone?: string;
    message: string;
    template_id?: string;
    media_url?: string;
}

export interface WebhookAction extends BaseAction {
    type: 'send_webhook';
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers: Record<string, string>;
    body?: string;
    timeout?: number;
    retry_count?: number;
}

export interface ConditionAction extends BaseAction {
    type: 'condition';
    conditions: Condition[];
    operator: 'AND' | 'OR';
    yesActions: Action[];
    noActions: Action[];
}

export interface DelayAction extends BaseAction {
    type: 'delay';
    duration: number; // in minutes
    unit: 'minutes' | 'hours' | 'days';
}

export interface TagAction extends BaseAction {
    type: 'add_tag' | 'remove_tag';
    tags: string[];
}

export interface UpdateFieldAction extends BaseAction {
    type: 'update_field';
    field: string;
    value: string | number | boolean;
}

export interface AssignAction extends BaseAction {
    type: 'assign_to_user';
    user_id: number;
    notify_user?: boolean;
}

export type Action = 
    | EmailAction 
    | WhatsAppAction 
    | WebhookAction 
    | ConditionAction 
    | DelayAction 
    | TagAction
    | UpdateFieldAction
    | AssignAction;

// Action type guards for better type safety
export const isEmailAction = (action: Action): action is EmailAction => action.type === 'send_email';
export const isWhatsAppAction = (action: Action): action is WhatsAppAction => action.type === 'send_whatsapp';
export const isWebhookAction = (action: Action): action is WebhookAction => action.type === 'send_webhook';
export const isConditionAction = (action: Action): action is ConditionAction => action.type === 'condition';
export const isDelayAction = (action: Action): action is DelayAction => action.type === 'delay';
export const isTagAction = (action: Action): action is TagAction => action.type === 'add_tag' || action.type === 'remove_tag';
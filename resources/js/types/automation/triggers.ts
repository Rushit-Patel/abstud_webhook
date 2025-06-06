import { Condition } from './conditions';

export interface BaseTrigger {
    type: string;
    name?: string;
    description?: string;
    conditions?: Condition[]; // Optional conditions for triggers
}

export interface LeadTrigger extends BaseTrigger {
    type: 'create_new_lead' | 'update_lead_status';
    source?: string[];
    status_from?: string[];
    status_to?: string[];
    lead_source_filter?: string[];
}

export interface FacebookTrigger extends BaseTrigger {
    type: 'facebook_lead_form';
    page_id: string;
    form_id: string;
    page_access_token?: string;
    verify_token?: string;
}

export interface WebhookTrigger extends BaseTrigger {
    type: 'inbound_webhook';
    webhook_url?: string;
    secret_key?: string;
    allowed_ips?: string[];
    expected_headers?: Record<string, string>;
}

export interface EmailTrigger extends BaseTrigger {
    type: 'email_opened' | 'email_clicked' | 'email_bounced' | 'email_replied';
    campaign_id?: string;
    email_template_id?: string;
    link_url?: string; // for email_clicked
}

export interface FormTrigger extends BaseTrigger {
    type: 'form_submitted';
    form_id: string;
    form_name?: string;
}

export interface ScheduleTrigger extends BaseTrigger {
    type: 'schedule';
    schedule_type: 'once' | 'daily' | 'weekly' | 'monthly';
    schedule_time: string; // HH:MM format
    schedule_date?: string; // YYYY-MM-DD for 'once'
    schedule_day?: number; // 1-7 for weekly, 1-31 for monthly
}

export type Trigger = 
    | LeadTrigger 
    | FacebookTrigger 
    | WebhookTrigger 
    | EmailTrigger 
    | FormTrigger
    | ScheduleTrigger;

// Trigger type guards
export const isLeadTrigger = (trigger: Trigger): trigger is LeadTrigger => 
    trigger.type === 'create_new_lead' || trigger.type === 'update_lead_status';
export const isFacebookTrigger = (trigger: Trigger): trigger is FacebookTrigger => 
    trigger.type === 'facebook_lead_form';
export const isWebhookTrigger = (trigger: Trigger): trigger is WebhookTrigger => 
    trigger.type === 'inbound_webhook';
export const isEmailTrigger = (trigger: Trigger): trigger is EmailTrigger => 
    ['email_opened', 'email_clicked', 'email_bounced', 'email_replied'].includes(trigger.type);
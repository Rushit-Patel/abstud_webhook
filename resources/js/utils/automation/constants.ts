export const ACTION_TYPES = {
    SEND_EMAIL: 'send_email',
    SEND_WHATSAPP: 'send_whatsapp',
    SEND_WEBHOOK: 'send_webhook',
    CONDITION: 'condition',
    DELAY: 'delay',
    ADD_TAG: 'add_tag',
    REMOVE_TAG: 'remove_tag',
} as const;

export const ACTION_CATEGORIES = {
    COMMUNICATION: 'communication',
    INTEGRATIONS: 'integrations',
    FLOW_CONTROL: 'flow_control',
    LEAD_MANAGEMENT: 'lead_management',
} as const;

export const TRIGGER_TYPES = {
    CREATE_NEW_LEAD: 'create_new_lead',
    UPDATE_LEAD_STATUS: 'update_lead_status',
    FACEBOOK_LEAD_FORM: 'facebook_lead_form',
    INBOUND_WEBHOOK: 'inbound_webhook',
    EMAIL_OPENED: 'email_opened',
    EMAIL_CLICKED: 'email_clicked',
    EMAIL_BOUNCED: 'email_bounced',
} as const;

export const CONDITION_OPERATORS = {
    EQUALS: 'equals',
    NOT_EQUALS: 'not_equals',
    CONTAINS: 'contains',
    NOT_CONTAINS: 'not_contains',
    GREATER_THAN: 'greater_than',
    LESS_THAN: 'less_than',
    STARTS_WITH: 'starts_with',
    ENDS_WITH: 'ends_with',
    IS_EMPTY: 'is_empty',
    IS_NOT_EMPTY: 'is_not_empty',
} as const;

export const WORKFLOW_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DRAFT: 'draft',
} as const;

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export const TIME_UNITS = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
] as const;

export const LEAD_STATUSES = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal Sent' },
    { value: 'negotiation', label: 'In Negotiation' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' },
] as const;
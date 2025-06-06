export interface Condition {
    id?: string;
    type: 'contact_field' | 'email_opened' | 'email_clicked' | 'trigger_type' | 'has_tag' | 'webhook_data' | 'date_field';
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'starts_with' | 'ends_with' | 'is_empty' | 'is_not_empty';
    value: string | number | boolean;
    case_sensitive?: boolean;
}

export interface ConditionGroup {
    id?: string;
    operator: 'AND' | 'OR';
    conditions: (Condition | ConditionGroup)[];
}

export type ConditionOperator = Condition['operator'];
export type ConditionType = Condition['type'];
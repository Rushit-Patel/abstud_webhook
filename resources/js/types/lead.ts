export interface LeadField {
    id: number;
    name: string;
    label: string;
    type: string;
    options?: any[];
    settings?: {
      required?: boolean;
      unique?: boolean;
      placeholder?: string;
      default_value?: string;
      validation?: {
        min?: string;
        max?: string;
        pattern?: string;
      };
    };
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  }
  
  export interface Lead {
    id: number;
    raw_payload: Record<string, any>;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    field_values?: LeadFieldValue[];
  }
  
  export interface LeadFieldValue {
    id: number;
    lead_id: number;
    lead_field_id: number;
    value: string | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    field?: LeadField;
  }
  
  export interface LeadFormData {
    [key: string]: string | string[] | boolean | null;
  }
  
  export interface SettingMenu {
    name: string;
    label: string;
    icon?: string;
    route: string;
    active: boolean;
  }
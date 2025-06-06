export interface BaseEntity {
    id: number;
    created_at?: string;
    updated_at?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}

export interface APIResponse<T = any> {
    data: T;
    message?: string;
    success: boolean;
}

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
    icon?: React.ReactNode;
}

export interface CategoryOption {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: string;
    isPremium?: boolean;
    isNew?: boolean;
}
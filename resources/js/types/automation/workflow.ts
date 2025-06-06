import { BaseEntity } from './common';
import { Trigger } from './triggers';
import { Action } from './actions';

export interface Workflow extends BaseEntity {
    name: string;
    description?: string;
    is_active: boolean;
    trigger: Trigger;
    actions: Action[];
    tags?: string[];
    folder_id?: number;
    last_run_at?: string;
    total_runs?: number;
    success_runs?: number;
    failed_runs?: number;
    success_rate?: number;
    average_execution_time?: number; // in seconds
    created_by?: number;
    updated_by?: number;
}

export interface WorkflowFormData {
    name: string;
    description?: string;
    is_active: boolean;
    trigger: Record<string, any>;
    actions: Record<string, any>[];
    tags?: string[];
    folder_id?: number;
}

export interface WorkflowStats {
    total: number;
    active: number;
    inactive: number;
    draft: number;
    total_runs_today: number;
    total_runs_this_week: number;
    total_runs_this_month: number;
    average_success_rate: number;
}

export interface WorkflowFilters {
    search?: string;
    status?: 'all' | 'active' | 'inactive' | 'draft';
    category?: string;
    tags?: string[];
    created_by?: number;
    date_from?: string;
    date_to?: string;
}

export interface WorkflowExecution {
    id: number;
    workflow_id: number;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    started_at: string;
    completed_at?: string;
    error_message?: string;
    execution_time?: number; // in seconds
    trigger_data?: Record<string, any>;
    actions_executed: number;
    actions_total: number;
}

export interface WorkflowFolder {
    id: number;
    name: string;
    description?: string;
    color?: string;
    workflow_count?: number;
    created_at: string;
    updated_at: string;
}

// Workflow utility types
export type WorkflowStatus = 'active' | 'inactive' | 'draft';
export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled';
export type WorkflowComplexity = 'simple' | 'medium' | 'complex';
import { Edge, Node } from "@xyflow/react";

// src/types/automation.ts (unchanged)
export interface Trigger {
  id?: number;
  type: string;
  config?: Record<string, any>;
  formId?: string;
  pageId?: string;
  pipelineId?: string;
  status?: string;
  webhookUrl?: string;
  templateId?: string;
}

export interface Condition {
  id?: number;
  type: string;
  field?: string;
  operator?: string;
  value?: any;
}

export interface Action {
  id?: number;
  type: string;
  config?: Record<string, any>;
  conditions?: Condition[];
  yesActions?: Action[];
  noActions?: Action[];
  description?: string;
  
  // Webhook properties
  webhookUrl?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, any>;
  
  // Email properties
  template?: string;
  subject?: string;
  to?: string;
  
  // WhatsApp properties
  message?: string;
}

export interface Workflow {
  id: number;
  name: string;
  is_active: boolean;
  trigger: Trigger;
  trigger_type: string;
  actions: Action[];
  description?: string;
  total_runs: number;
  tags: string[];
  status: string;
  version: number;
  success_runs: number;
  failed_runs: number;
  is_template: boolean;
  success_rate: number;
  average_execution_time_ms: number;
}

export interface BranchResult {
  nodes: Node[]; 
  edges: Edge[]; 
  maxY: number; 
  endNodeIds: string[];
}
// resources/js/pages/Automation/WorkflowBuilder.tsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// ... other imports

interface WorkflowBuilderProps {
    initialWorkflow?: Workflow;
    onSave?: (workflow: Workflow) => Promise<Workflow>;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ 
    initialWorkflow, 
    onSave: onSaveProp 
}) => {
    const { workflowId } = useParams<{ workflowId?: string }>();
    const navigate = useNavigate();
    
    const [workflow, setWorkflow] = useState<Workflow>(
        initialWorkflow || {
            name: 'Untitled Workflow',
            description: '',
            trigger_type: 'webhook',
            status: 'draft',
            version: 1,
            is_template: false,
            total_runs: 0,
            success_runs: 0,
            failed_runs: 0,
            success_rate: 0,
            average_execution_time_ms: 0,
            // Legacy compatibility
            trigger: { type: '' },
            actions: [],
            is_active: false,
        },
    );

    const [loading, setLoading] = useState(false);
    // ... other state

    // Load workflow if editing existing one
    useEffect(() => {
        if (workflowId && workflowId !== 'new' && !initialWorkflow) {
            setLoading(true);
            fetch(`/automation/workflows/${workflowId}`)
                .then(response => response.json())
                .then(data => {
                    setWorkflow(data);
                })
                .catch(error => {
                    console.error('Failed to load workflow:', error);
                    setError('Failed to load workflow');
                })
                .finally(() => setLoading(false));
        }
    }, [workflowId, initialWorkflow]);

    const handleSave = useCallback(async () => {
        if (!workflow.trigger?.type && !workflow.trigger_type) {
            setError('Please configure a trigger first');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            let savedWorkflow: Workflow;

            if (onSaveProp) {
                savedWorkflow = await onSaveProp(workflow);
            } else {
                // Default save implementation
                const url = workflow.id 
                    ? `/automation/workflows/${workflow.id}` 
                    : '/automation/workflows';
                    
                const method = workflow.id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(workflow),
                });

                if (!response.ok) {
                    throw new Error('Failed to save workflow');
                }

                savedWorkflow = await response.json();
            }

            setWorkflow(savedWorkflow);
            
            // Redirect to edit mode if creating new workflow
            if (!workflow.id && savedWorkflow.id) {
                navigate(`/automation/workflows/${savedWorkflow.id}/edit`, { replace: true });
            }

        } catch (err: any) {
            setError(err.message || 'Failed to save workflow');
        } finally {
            setIsSaving(false);
        }
    }, [workflow, onSaveProp, navigate]);

    // Now workflowId is available from useParams or workflow.id
    const currentWorkflowId = workflow.id || (workflowId !== 'new' ? parseInt(workflowId || '0') : undefined);

    return (
        <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50">
            {/* ... existing JSX */}
            
            {/* Fix the TriggerSelector workflowId issue */}
            {selectedNodeType === 'trigger' && (
                <TriggerSelector
                    selectedTrigger={workflow.trigger || { type: workflow.trigger_type }}
                    onChange={handleTriggerSelect}
                    onClose={() => setIsSidebarOpen(false)}
                    workflowId={currentWorkflowId}
                />
            )}
            
            {/* ... rest of JSX */}
        </div>
    );
};

export default WorkflowBuilder;
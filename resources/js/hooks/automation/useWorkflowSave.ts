import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Workflow } from '@/types/automation';
import { validateWorkflow, sanitizeWorkflowData } from '@/utils/automation/validationUtils';

export const useWorkflowSave = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const saveWorkflow = useCallback(async (workflow: Workflow): Promise<boolean> => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Validate workflow before saving
            const validation = validateWorkflow(workflow);
            if (!validation.isValid) {
                setError(validation.errors.join(', '));
                return false;
            }

            // Sanitize data
            const sanitizedWorkflow = sanitizeWorkflowData(workflow);

            const method = workflow.id && workflow.id > 0 ? 'put' : 'post';
            const url = workflow.id && workflow.id > 0
                ? route('automation.workflows.update', workflow.id)
                : route('automation.workflows.store');

            const data = {
                name: sanitizedWorkflow.name,
                description: sanitizedWorkflow.description,
                is_active: sanitizedWorkflow.is_active,
                trigger: sanitizedWorkflow.trigger,
                actions: sanitizedWorkflow.actions,
                tags: sanitizedWorkflow.tags,
            };

            return new Promise((resolve) => {
                router[method](url, data, {
                    onSuccess: (page) => {
                        setSuccess('Workflow saved successfully!');
                        setTimeout(() => setSuccess(null), 3000);
                        resolve(true);
                    },
                    onError: (errors) => {
                        const errorMessage = typeof errors === 'object' && errors.message
                            ? errors.message
                            : 'Failed to save workflow';
                        setError(errorMessage);
                        resolve(false);
                    },
                });
            });
        } catch (error: any) {
            setError(error?.response?.data?.message || 'Failed to save workflow');
            return false;
        } finally {
            setIsSaving(false);
        }
    }, []);

    const saveAllWorkflows = useCallback(async (): Promise<boolean> => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            return new Promise((resolve) => {
                router.post(route('automation.saveAll'), {}, {
                    onSuccess: () => {
                        setSuccess('All workflows saved successfully!');
                        setTimeout(() => setSuccess(null), 3000);
                        resolve(true);
                    },
                    onError: (errors) => {
                        const errorMessage = typeof errors === 'object' && errors.message
                            ? errors.message
                            : 'Failed to save workflows';
                        setError(errorMessage);
                        resolve(false);
                    },
                });
            });
        } catch (error: any) {
            setError(error?.response?.data?.message || 'Failed to save workflows');
            return false;
        } finally {
            setIsSaving(false);
        }
    }, []);

    const clearMessages = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    return {
        saveWorkflow,
        saveAllWorkflows,
        isSaving,
        error,
        success,
        clearMessages,
    };
};
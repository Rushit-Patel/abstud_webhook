import { useState, useEffect, useCallback } from 'react';
import { Workflow } from '@/types/automation';
import { createNewWorkflow } from '@/utils/automation/workflowUtils';

interface UseWorkflowStateProps {
    initialWorkflows: Workflow[];
    initialWorkflowId?: string;
}

export const useWorkflowState = ({ initialWorkflows, initialWorkflowId }: UseWorkflowStateProps) => {
    const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [workflowToDelete, setWorkflowToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        if (initialWorkflowId) {
            const workflow = workflows.find((w) => w.id === parseInt(initialWorkflowId));
            if (workflow) {
                setSelectedWorkflow(workflow);
            }
        }
    }, [initialWorkflowId, workflows]);

    let filteredWorkflows: Workflow[] = [];

    if (Array.isArray(workflows)) {
        filteredWorkflows = workflows.filter(workflow => {
            const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || 
                (filterStatus === 'active' && workflow.is_active) ||
                (filterStatus === 'inactive' && !workflow.is_active);
            
            return matchesSearch && matchesStatus;
        });
    } else {
        filteredWorkflows = [] as Workflow[];
    }
    const openDeleteDialog = useCallback((id: number) => {
        setWorkflowToDelete(id);
        setIsDeleteDialogOpen(true);
    }, []);

    const closeDeleteDialog = useCallback(() => {
        setIsDeleteDialogOpen(false);
        setWorkflowToDelete(null);
    }, []);

    const createNewWorkflowHandler = useCallback(() => {
        setSelectedWorkflow(createNewWorkflow());
    }, []);

    const updateWorkflow = useCallback((updatedWorkflow: Workflow) => {
        setWorkflows(prev => 
            prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w)
        );
        setSelectedWorkflow(updatedWorkflow);
    }, []);

    const removeWorkflow = useCallback((id: number) => {
        setWorkflows(prev => prev.filter(w => w.id !== id));
        if (selectedWorkflow?.id === id) {
            setSelectedWorkflow(null);
        }
    }, [selectedWorkflow]);

    return {
        workflows: filteredWorkflows,
        allWorkflows: workflows,
        selectedWorkflow,
        isDeleteDialogOpen,
        workflowToDelete,
        searchTerm,
        filterStatus,
        setWorkflows,
        setSelectedWorkflow,
        setSearchTerm,
        setFilterStatus,
        openDeleteDialog,
        closeDeleteDialog,
        createNewWorkflowHandler,
        updateWorkflow,
        removeWorkflow,
    };
};
import React from 'react';
import { Workflow } from '@/types/automation';
import { WorkflowSidebar } from './WorkflowSidebar';
import { WorkflowMain } from './WorkflowMain';

interface AutomationContentProps {
    workflowState: {
        workflows: Workflow[];
        selectedWorkflow: Workflow | null;
        isDeleteDialogOpen: boolean;
        workflowToDelete: number | null;
        searchTerm: string;
        filterStatus: 'all' | 'active' | 'inactive';
        setSelectedWorkflow: (workflow: Workflow | null) => void;
        setSearchTerm: (term: string) => void;
        setFilterStatus: (status: 'all' | 'active' | 'inactive') => void;
        openDeleteDialog: (id: number) => void;
        closeDeleteDialog: () => void;
        createNewWorkflowHandler: () => void;
        updateWorkflow: (workflow: Workflow) => void;
        removeWorkflow: (id: number) => void;
    };
    saveWorkflow: (workflow: Workflow) => Promise<boolean>;
    isSaving: boolean;
    onClearMessages: () => void;
}

export const AutomationContent: React.FC<AutomationContentProps> = ({
    workflowState,
    saveWorkflow,
    isSaving,
    onClearMessages,
}) => {
    return (
        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <WorkflowSidebar
                workflows={workflowState.workflows}
                selectedWorkflow={workflowState.selectedWorkflow}
                searchTerm={workflowState.searchTerm}
                filterStatus={workflowState.filterStatus}
                isDeleteDialogOpen={workflowState.isDeleteDialogOpen}
                workflowToDelete={workflowState.workflowToDelete}
                onSelectWorkflow={workflowState.setSelectedWorkflow}
                onSearchChange={workflowState.setSearchTerm}
                onFilterChange={workflowState.filterStatus}
                onCreateNew={workflowState.createNewWorkflowHandler}
                onDeleteWorkflow={workflowState.openDeleteDialog}
                onCloseDeleteDialog={workflowState.closeDeleteDialog}
                onConfirmDelete={(id) => {
                    workflowState.removeWorkflow(id);
                    workflowState.closeDeleteDialog();
                }}
            />

            {/* Main Content */}
            <WorkflowMain
                selectedWorkflow={workflowState.selectedWorkflow}
                onSaveWorkflow={saveWorkflow}
                onUpdateWorkflow={workflowState.updateWorkflow}
                onCloseWorkflow={() => workflowState.setSelectedWorkflow(null)}
                isSaving={isSaving}
                onClearMessages={onClearMessages}
            />
        </div>
    );
};
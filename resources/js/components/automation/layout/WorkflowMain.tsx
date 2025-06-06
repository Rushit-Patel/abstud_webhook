import React from 'react';
import { Workflow } from '@/types/automation';
import { WorkflowBuilder } from '../workflow/WorkflowBuilder';
import { EmptyWorkflowState } from '../common/EmptyWorkflowState';

interface WorkflowMainProps {
    selectedWorkflow: Workflow | null;
    onSaveWorkflow: (workflow: Workflow) => Promise<boolean>;
    onUpdateWorkflow: (workflow: Workflow) => void;
    onCloseWorkflow: () => void;
    isSaving: boolean;
    onClearMessages: () => void;
}

export const WorkflowMain: React.FC<WorkflowMainProps> = ({
    selectedWorkflow,
    onSaveWorkflow,
    onUpdateWorkflow,
    onCloseWorkflow,
    isSaving,
    onClearMessages,
}) => {
    if (!selectedWorkflow) {
        return <EmptyWorkflowState />;
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <WorkflowBuilder
                workflow={selectedWorkflow}
                onSave={onSaveWorkflow}
                onUpdate={onUpdateWorkflow}
                onClose={onCloseWorkflow}
                isSaving={isSaving}
                onClearMessages={onClearMessages}
            />
        </div>
    );
};
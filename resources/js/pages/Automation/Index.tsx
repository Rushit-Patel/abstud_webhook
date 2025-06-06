import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {  Workflow } from '@/types/automation';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import { useWorkflowState } from '@/hooks/automation/useWorkflowState';
import { useWorkflowSave } from '@/hooks/automation/useWorkflowSave';
import { AutomationErrorBoundary } from '@/components/automation/common/AutomationErrorBoundary';
import { AutomationHeader } from '@/components/automation/layout/AutomationHeader';
import { AutomationContent } from '@/components/automation/layout/AutomationContent';

interface AutomationIndexProps {
    initialWorkflowId?: string;
    workflows: Workflow[];
}

const getBreadcrumbs = (workflowId?: string): BreadcrumbItem[] => [
    { title: 'Home', href: route('dashboard') },
    { title: 'Leads', href: route('leads.index') },
    { title: 'Automation', href: route('automation.index') },
    ...(workflowId ? [{ title: 'Workflow', href: route('automation.index', { id: workflowId }) }] : []),
];

const AutomationIndex: React.FC<AutomationIndexProps> = ({ 
    initialWorkflowId, 
    workflows: initialWorkflows 
}) => {
    const workflowState = useWorkflowState({ 
        initialWorkflows, 
        initialWorkflowId 
    });
    
    const { 
        saveWorkflow, 
        saveAllWorkflows, 
        isSaving, 
        error, 
        success, 
        clearMessages 
    } = useWorkflowSave();

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(initialWorkflowId)}>
            <Head title="Automation Builder" />
            
            <AutomationErrorBoundary>
                <div className="flex h-[calc(100vh-4rem)] flex-col bg-gradient-to-br from-slate-50 to-blue-50">
                    {/* Status Messages */}
                    {error && (
                        <Alert variant="destructive" className="mx-6 mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert className="mx-6 mt-4 border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-700">{success}</AlertDescription>
                        </Alert>
                    )}

                    {/* Header */}
                    <AutomationHeader
                        isSaving={isSaving}
                        onSaveAll={saveAllWorkflows}
                        workflowCount={workflowState.allWorkflows.length}
                    />

                    {/* Main Content */}
                    <AutomationContent
                        workflowState={workflowState}
                        saveWorkflow={saveWorkflow}
                        isSaving={isSaving}
                        onClearMessages={clearMessages}
                    />
                </div>
            </AutomationErrorBoundary>
        </AppLayout>
    );
};

export default AutomationIndex;
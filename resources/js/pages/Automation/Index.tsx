// src/components/automation/index.tsx
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Workflow } from '@/types/automation';
import { Head, router } from '@inertiajs/react';
import '@xyflow/react/dist/style.css';
import { useState } from 'react';
import WorkflowList from './WorkflowList';

interface AutomationIndexProps {
    initialWorkflowId?: string;
    workflows: Workflow[];
}

const getBreadcrumbs = (workflowId?: string): BreadcrumbItem[] => [
    { title: 'Home', href: route('dashboard') },
    { title: 'Leads', href: route('leads.index') },
    ...(workflowId ? [{ title: 'Workflow', href: route('automation.index', { id: workflowId }) }] : []),
];

const AutomationIndex: React.FC<AutomationIndexProps> = ({ initialWorkflowId, workflows }) => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            await router.post(route('automation.saveAll'));
        } catch (error) {
            console.error('Failed to save workflows:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(initialWorkflowId)}>
            <Head title="Automation Builder" />
            <div className="flex h-[calc(100vh-4rem)] flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h1 className="text-xl font-semibold">Workflows</h1>
                    <Button 
                        onClick={handleSaveAll} 
                        disabled={isSaving}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isSaving ? 'Saving...' : 'Save All Workflows'}
                    </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                    <WorkflowList initialWorkflowId={initialWorkflowId} workflows={workflows} />
                </div>
            </div>
        </AppLayout>
    );
};

export default AutomationIndex;

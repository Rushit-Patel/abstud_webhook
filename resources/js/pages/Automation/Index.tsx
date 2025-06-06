import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Workflow } from '@/types/automation';
import { Head, router } from '@inertiajs/react';
import '@xyflow/react/dist/style.css';
import { AlertCircle, Loader2, Save } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import WorkflowList from './WorkflowList';

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

const AutomationIndex: React.FC<AutomationIndexProps> = ({ initialWorkflowId, workflows }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSaveAll = useCallback(async () => {
        if (isSaving) return;

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await router.post(
                route('automation.saveAll'),
                {},
                {
                    onSuccess: () => {
                        setSuccess('All workflows saved successfully!');
                        setTimeout(() => setSuccess(null), 3000);
                    },
                    onError: (errors) => {
                        setError(errors.message || 'Failed to save workflows');
                    },
                },
            );
        } catch (error: any) {
            setError(error?.response?.data?.message || 'Failed to save workflows');
        } finally {
            setIsSaving(false);
        }
    }, [isSaving]);

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(initialWorkflowId)}>
            <Head title="Automation Builder" />

            <div className="flex h-[calc(100vh-4rem)] flex-col bg-gradient-to-br from-slate-50 to-blue-50">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-white/80 px-6 py-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Workflow Automation</h1>
                            <p className="text-sm text-gray-500">Build and manage your automated workflows</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="bg-blue-600 text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save All Workflows
                            </>
                        )}
                    </Button>
                </div>

                {/* Notifications */}
                <div className="px-6 pt-4">
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden">
                    <WorkflowList initialWorkflowId={initialWorkflowId} workflows={workflows} />
                </div>
            </div>
        </AppLayout>
    );
};

export default AutomationIndex;

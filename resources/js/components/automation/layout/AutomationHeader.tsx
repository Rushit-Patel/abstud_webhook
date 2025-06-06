import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Zap, Workflow } from 'lucide-react';

interface AutomationHeaderProps {
    isSaving: boolean;
    onSaveAll: () => Promise<boolean>;
    workflowCount: number;
}

export const AutomationHeader: React.FC<AutomationHeaderProps> = ({
    isSaving,
    onSaveAll,
    workflowCount,
}) => {
    const handleSaveAll = async () => {
        await onSaveAll();
    };

    return (
        <div className="flex items-center justify-between border-b bg-white/80 px-6 py-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                    <Workflow className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Workflow Automation
                        </h1>
                        <Badge variant="secondary" className="text-xs">
                            {workflowCount} workflow{workflowCount !== 1 ? 's' : ''}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                        Build and manage your automated workflows
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://docs.example.com/automation', '_blank')}
                >
                    <Zap className="mr-2 h-4 w-4" />
                    Documentation
                </Button>
                
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
                            Save All
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};
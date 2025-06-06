import React from 'react';
import { Button } from '@/components/ui/button';
import { Workflow, Zap, ArrowRight } from 'lucide-react';

export const EmptyWorkflowState: React.FC = () => {
    return (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="text-center max-w-md">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Workflow className="h-8 w-8 text-blue-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a Workflow
                </h3>
                
                <p className="text-gray-600 mb-6">
                    Choose a workflow from the sidebar to start editing, or create a new one to automate your processes.
                </p>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Zap className="h-4 w-4" />
                        <span>Automate your lead management</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <ArrowRight className="h-4 w-4" />
                        <span>Connect multiple systems</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Workflow className="h-4 w-4" />
                        <span>Save time with smart automation</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
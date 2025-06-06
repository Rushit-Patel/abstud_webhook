import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Workflow } from '@/types/automation';
import { WorkflowCard } from '../common/WorkflowCard';
import { DeleteConfirmDialog } from '../common/DeleteConfirmDialog';
import { Plus, Search } from 'lucide-react';

interface WorkflowSidebarProps {
    workflows: Workflow[];
    selectedWorkflow: Workflow | null;
    searchTerm: string;
    filterStatus: 'all' | 'active' | 'inactive';
    isDeleteDialogOpen: boolean;
    workflowToDelete: number | null;
    onSelectWorkflow: (workflow: Workflow) => void;
    onSearchChange: (term: string) => void;
    onFilterChange: (status: 'all' | 'active' | 'inactive') => void;
    onCreateNew: () => void;
    onDeleteWorkflow: (id: number) => void;
    onCloseDeleteDialog: () => void;
    onConfirmDelete: (id: number) => void;
}

export const WorkflowSidebar: React.FC<WorkflowSidebarProps> = ({
    workflows,
    selectedWorkflow,
    searchTerm,
    filterStatus,
    isDeleteDialogOpen,
    workflowToDelete,
    onSelectWorkflow,
    onSearchChange,
    onFilterChange,
    onCreateNew,
    onDeleteWorkflow,
    onCloseDeleteDialog,
    onConfirmDelete,
}) => {
    return (
        <>
            <div className="w-80 border-r bg-white flex flex-col">
                {/* Sidebar Header */}
                <div className="p-4 border-b">
                    <Button
                        onClick={onCreateNew}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Workflow
                    </Button>
                </div>

                {/* Search and Filter */}
                <div className="p-4 space-y-3 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search workflows..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    
                    <Select value={filterStatus} onValueChange={onFilterChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Workflows</SelectItem>
                            <SelectItem value="active">Active Only</SelectItem>
                            <SelectItem value="inactive">Inactive Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Workflow List */}
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-3">
                        {workflows.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No workflows found</p>
                                <p className="text-sm">Create your first workflow to get started</p>
                            </div>
                        ) : (
                            workflows.map((workflow) => (
                                <WorkflowCard
                                    key={workflow.id}
                                    workflow={workflow}
                                    isSelected={selectedWorkflow?.id === workflow.id}
                                    onSelect={() => onSelectWorkflow(workflow)}
                                    onEdit={() => onSelectWorkflow(workflow)}
                                    onDelete={() => onDeleteWorkflow(workflow.id)}
                                    onToggleStatus={() => {
                                        // Handle toggle status
                                        console.log('Toggle status for workflow:', workflow.id);
                                    }}
                                    onDuplicate={() => {
                                        // Handle duplicate
                                        console.log('Duplicate workflow:', workflow.id);
                                    }}
                                />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={onCloseDeleteDialog}
                onConfirm={() => {
                    if (workflowToDelete) {
                        onConfirmDelete(workflowToDelete);
                    }
                }}
                title="Delete Workflow"
                description="Are you sure you want to delete this workflow? This action cannot be undone."
            />
        </>
    );
};
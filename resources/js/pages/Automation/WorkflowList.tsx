// src/components/automation/WorkflowList.tsx
import { Button } from '@/components/ui/button';
import { ButtonWithTooltip } from '@/components/ui/button-with-tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Workflow } from '@/types/automation';
import { Page, PageProps } from '@inertiajs/core';
import { router, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import WorkflowBuilder from './WorkflowBuilder';

interface WorkflowListProps {
    initialWorkflowId?: string;
    workflows: Workflow[];
}

type WorkflowFormData = {
    name: string;
    is_active: boolean;
    trigger: Record<string, any>;
    actions: Record<string, any>[];
};

interface WorkflowPageProps extends PageProps {
    workflows: Workflow[];
    [key: string]: any;
}

const WorkflowList: React.FC<WorkflowListProps> = ({ initialWorkflowId, workflows: initialWorkflows }) => {
    const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [workflowToDelete, setWorkflowToDelete] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const { data, setData, get } = useForm({ search: '' });

    useEffect(() => {
        if (initialWorkflowId) {
            const workflow = workflows.find((w) => w.id === parseInt(initialWorkflowId));
            if (workflow) setSelectedWorkflow(workflow);
        }
    }, [initialWorkflowId, workflows]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setData('search', search);
            get(route('automation.workflows'), {
                preserveState: true,
                onSuccess: (page) => {
                    const pageData = (page.props as unknown) as WorkflowPageProps;
                    if (pageData.workflows) {
                        setWorkflows(pageData.workflows);
                    }
                },
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleEdit = (workflow: Workflow) => {
        setSelectedWorkflow(workflow);
    };

    const handleDelete = async () => {
        if (workflowToDelete) {
            router.delete(route('automation.workflows.destroy', workflowToDelete), {
                onSuccess: () => {
                    setWorkflows(workflows.filter((w) => w.id !== workflowToDelete));
                    setIsDeleteDialogOpen(false);
                    setWorkflowToDelete(null);
                },
            });
        }
    };

    const handleNewWorkflow = () => {
        setSelectedWorkflow({ id: 0, name: '', is_active: true, trigger: { type: '' }, actions: [] });
    };

    const handleSaveWorkflow = (workflow: Workflow) => {
        const method = workflow.id ? 'put' : 'post';
        const url = workflow.id 
            ? route('automation.workflows.update', workflow.id)
            : route('automation.workflows.store');

        const data: WorkflowFormData = {
            name: workflow.name,
            is_active: workflow.is_active,
            trigger: workflow.trigger,
            actions: workflow.actions,
        };

        router[method](url, data, {
            onSuccess: (page) => {
                const pageData = (page.props as unknown) as WorkflowPageProps;
                if (pageData.workflows) {
                    setWorkflows(pageData.workflows);
                }
                setSelectedWorkflow(null);
            },
        });
    };

    if (selectedWorkflow) {
        return (
            <div className="h-full">
                <WorkflowBuilder
                    initialWorkflow={selectedWorkflow}
                    onSave={handleSaveWorkflow}
                />
            </div>
        );
    }

    return (
        <div className="h-full p-6">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex-1 max-w-md">
                    <Input 
                        placeholder="Search workflows..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        className="w-full"
                    />
                </div>
                <ButtonWithTooltip 
                    variant="default" 
                    size="icon" 
                    tooltip="Add Workflow" 
                    onClick={handleNewWorkflow}
                    className="ml-4"
                >
                    <Plus className="h-5 w-5" />
                </ButtonWithTooltip>
            </div>

            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Trigger</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workflows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                    No workflows found. Create your first workflow by clicking the + button.
                                </TableCell>
                            </TableRow>
                        ) : (
                            workflows.map((workflow) => (
                                <TableRow key={workflow.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEdit(workflow)}>
                                    <TableCell className="font-medium">{workflow.name || 'Untitled'}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                            workflow.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {workflow.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{workflow.trigger.type.replace(/_/g, ' ').toUpperCase()}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <ButtonWithTooltip
                                                variant="ghost"
                                                size="icon"
                                                tooltip="Edit"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(workflow);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </ButtonWithTooltip>
                                            <ButtonWithTooltip
                                                variant="ghost"
                                                size="icon"
                                                tooltip="Delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setWorkflowToDelete(workflow.id || null);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                            >
                                                <Trash className="h-4 w-4 text-destructive" />
                                            </ButtonWithTooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Workflow</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this workflow? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default WorkflowList;

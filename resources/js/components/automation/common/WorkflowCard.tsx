import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Workflow } from '@/types/automation';
import { Edit3, Play, Pause, Trash2, Copy, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';
import { calculateWorkflowComplexity, generateWorkflowSummary } from '@/utils/automation/workflowUtils';

interface WorkflowCardProps {
    workflow: Workflow;
    isSelected?: boolean;
    onSelect: () => void;
    onEdit: (workflow: Workflow) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (workflow: Workflow) => void;
    onDuplicate: (workflow: Workflow) => void;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
    workflow,
    isSelected = false,
    onSelect,
    onEdit,
    onDelete,
    onToggleStatus,
    onDuplicate,
}) => {
    const complexity = calculateWorkflowComplexity(workflow);
    const summary = generateWorkflowSummary(workflow);

    const complexityColors = {
        simple: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        complex: 'bg-red-100 text-red-800',
    };

    return (
        <Card 
            className={cn(
                "group hover:shadow-md transition-all duration-200 cursor-pointer",
                isSelected && "ring-2 ring-blue-500 shadow-md"
            )}
            onClick={onSelect}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {workflow.name || 'Untitled Workflow'}
                        </CardTitle>
                        {workflow.description && (
                            <CardDescription className="mt-1 text-xs text-gray-600">
                                {workflow.description}
                            </CardDescription>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(workflow); }}>
                                <Edit3 className="mr-2 h-3 w-3" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleStatus(workflow); }}>
                                {workflow.is_active ? (
                                    <>
                                        <Pause className="mr-2 h-3 w-3" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-3 w-3" />
                                        Activate
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(workflow); }}>
                                <Copy className="mr-2 h-3 w-3" />
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onClick={(e) => { e.stopPropagation(); onDelete(workflow.id); }}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="mr-2 h-3 w-3" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            
            <CardContent>
                <div className="space-y-2">
                    <p className="text-xs text-gray-600">{summary}</p>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <Badge variant={workflow.is_active ? "default" : "secondary"} className="text-xs">
                                {workflow.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${complexityColors[complexity]}`}>
                                {complexity}
                            </Badge>
                        </div>
                        
                        {workflow.total_runs !== undefined && (
                            <div className="text-xs text-gray-500">
                                {workflow.total_runs} runs
                            </div>
                        )}
                    </div>
                    
                    {workflow.tags && workflow.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {workflow.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {workflow.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                    +{workflow.tags.length - 2}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
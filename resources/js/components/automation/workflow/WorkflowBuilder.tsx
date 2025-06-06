import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Action, Trigger, Workflow } from '@/types/automation';
import {
    addEdge,
    Background,
    BackgroundVariant,
    Connection,
    Controls,
    Edge,
    Handle,
    MiniMap,
    Node,
    NodeProps,
    Position,
    ReactFlow,
    useEdgesState,
    useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
    AlertTriangle, 
    CheckCircle, 
    Edit3, 
    Eye, 
    Loader2, 
    Save, 
    X,
    Settings,
    Workflow as WorkflowIcon 
} from 'lucide-react';
import { validateWorkflow } from '@/utils/automation/validationUtils';
import { generateWorkflowSummary } from '@/utils/automation/workflowUtils';
import TriggerSelector from '@/pages/Automation/TriggerSelector';
import ActionSelector from '@/pages/Automation/ActionSelector';

interface WorkflowBuilderProps {
    workflow: Workflow;
    onSave: (workflow: Workflow) => Promise<boolean>;
    onUpdate: (workflow: Workflow) => void;
    onClose: () => void;
    isSaving: boolean;
    onClearMessages: () => void;
}

type CustomNodeData = {
    label: string;
    description?: string;
    condition?: string;
    isAddButton?: boolean;
    isEnd?: boolean;
    hasSelectedTrigger?: boolean;
    actionType?: string;
    status?: 'configured' | 'incomplete' | 'error';
};

type CustomNode = Node<CustomNodeData>;
type CustomEdge = Edge;

const TriggerNode: React.FC<NodeProps<CustomNode>> = ({ data, isConnectable }) => {
    const isConfigured = data.hasSelectedTrigger;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="group relative">
                        <div
                            className={`workflow-node rounded-xl border-2 px-4 py-3 shadow-lg transition-all duration-200 ${
                                isConfigured
                                    ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:border-blue-300'
                                    : 'border-dashed border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50 hover:border-gray-400'
                            } `}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`rounded-lg p-2 transition-colors ${isConfigured ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'} `}
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <div className={`font-medium ${isConfigured ? 'text-blue-900' : 'text-gray-600'}`}>{data.label}</div>
                                    {data.description && (
                                        <div className={`text-sm ${isConfigured ? 'text-blue-600' : 'text-gray-500'}`}>{data.description}</div>
                                    )}
                                </div>
                                {isConfigured && (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Ready
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {isConfigured && (
                            <Handle
                                type="source"
                                position={Position.Bottom}
                                isConnectable={isConnectable}
                                className="h-3 w-3 border-2 border-blue-400 bg-blue-200"
                            />
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                    <p>{isConfigured ? 'Click to edit trigger settings' : 'Click to configure trigger'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const ActionNode: React.FC<NodeProps<CustomNode>> = ({ data, isConnectable }) => {
    const isAddButton = data.isAddButton;
    const status = data.status || 'configured';

    const getStatusColor = () => {
        switch (status) {
            case 'configured':
                return 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50';
            case 'incomplete':
                return 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50';
            case 'error':
                return 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50';
            default:
                return 'border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50';
        }
    };

    if (isAddButton) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="group cursor-pointer">
                            <Handle
                                type="target"
                                position={Position.Top}
                                isConnectable={isConnectable}
                                className="h-3 w-3 border-2 border-gray-400 bg-gray-200"
                            />
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white transition-all duration-200 hover:border-blue-400 hover:bg-blue-50">
                                <svg
                                    className="h-6 w-6 text-gray-400 group-hover:text-blue-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add new action</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="group relative">
                        <Handle
                            type="target"
                            position={Position.Top}
                            isConnectable={isConnectable}
                            className="h-3 w-3 border-2 border-gray-400 bg-gray-200"
                        />

                        <div
                            className={`workflow-node rounded-xl border-2 px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl ${getStatusColor()} `}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`rounded-lg p-2 transition-colors ${
                                        status === 'configured'
                                            ? 'bg-green-100 text-green-600'
                                            : status === 'incomplete'
                                              ? 'bg-yellow-100 text-yellow-600'
                                              : status === 'error'
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{data.label}</div>
                                    {data.description && <div className="text-sm text-gray-600">{data.description}</div>}
                                </div>
                                <Badge
                                    variant={status === 'configured' ? 'default' : status === 'incomplete' ? 'secondary' : 'destructive'}
                                    className="text-xs"
                                >
                                    {status === 'configured' && <CheckCircle className="mr-1 h-3 w-3" />}
                                    {status === 'incomplete' && <AlertTriangle className="mr-1 h-3 w-3" />}
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Badge>
                            </div>
                        </div>

                        <Handle
                            type="source"
                            position={Position.Bottom}
                            isConnectable={isConnectable}
                            className="h-3 w-3 border-2 border-gray-400 bg-gray-200"
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                    <p>Click to edit this action</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const ConditionNode: React.FC<NodeProps<CustomNode>> = ({ data, isConnectable }) => {
    return (
        <div className="group relative">
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="h-3 w-3 border-2 border-purple-400 bg-purple-200"
            />

            <div className="workflow-node rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <div className="font-medium text-purple-900">{data.label}</div>
                        {data.condition && <div className="mt-1 rounded bg-purple-100 p-2 text-sm text-purple-600">{data.condition}</div>}
                    </div>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                id="yes"
                isConnectable={isConnectable}
                style={{ left: '25%' }}
                className="h-3 w-3 border-2 border-green-400 bg-green-200"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="no"
                isConnectable={isConnectable}
                style={{ left: '75%' }}
                className="h-3 w-3 border-2 border-red-400 bg-red-200"
            />

            <div className="absolute -bottom-8 left-1/4 -translate-x-1/2 transform">
                <Badge variant="outline" className="bg-green-100 text-xs text-green-700">
                    YES
                </Badge>
            </div>
            <div className="absolute -bottom-8 left-3/4 -translate-x-1/2 transform">
                <Badge variant="outline" className="bg-red-100 text-xs text-red-700">
                    NO
                </Badge>
            </div>
        </div>
    );
};

const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
    condition: ConditionNode,
};

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
    workflow: initialWorkflow,
    onSave,
    onUpdate,
    onClose,
    isSaving,
    onClearMessages,
}) => {
    const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow);
    const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedNodeType, setSelectedNodeType] = useState<'trigger' | 'action' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [showBasicInfo, setShowBasicInfo] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const hasTrigger = workflow.trigger.type !== '';

    // Update local workflow when prop changes
    useEffect(() => {
        setWorkflow(initialWorkflow);
        onClearMessages();
    }, [initialWorkflow, onClearMessages]);

    const validateAction = (action: Action): 'configured' | 'incomplete' | 'error' => {
        if (!action.type) return 'error';

        switch (action.type) {
            case 'send_email':
                return action.subject && action.body ? 'configured' : 'incomplete';
            case 'send_webhook':
                return action.url ? 'configured' : 'incomplete';
            case 'condition':
                return action.conditions && action.conditions.length > 0 ? 'configured' : 'incomplete';
            case 'send_whatsapp':
                return action.message ? 'configured' : 'incomplete';
            default:
                return 'configured';
        }
    };

    const getActionDescription = (actionType: string): string => {
        const descriptions: Record<string, string> = {
            send_email: 'Send email notification',
            send_webhook: 'Send data to external service',
            condition: 'Branch workflow based on conditions',
            send_whatsapp: 'Send WhatsApp message',
            delay: 'Wait before next action',
            add_tag: 'Add tags to lead',
            remove_tag: 'Remove tags from lead',
            update_field: 'Update lead field',
            assign_to_user: 'Assign to team member',
        };
        return descriptions[actionType] || 'Custom action';
    };

    const getConditionSummary = (action: Action): string => {
        if (!action.conditions || action.conditions.length === 0) {
            return 'No conditions set';
        }
        const condition = action.conditions[0];
        return `${condition.type}: ${condition.value}`;
    };

    const buildFlow = useCallback(() => {
        const newNodes: CustomNode[] = [];
        const newEdges: CustomEdge[] = [];

        // Add trigger node
        newNodes.push({
            id: 'trigger',
            type: 'trigger',
            data: {
                label: hasTrigger ? workflow.trigger.type.replace(/_/g, ' ').toUpperCase() : 'Add Trigger',
                description: hasTrigger ? 'Trigger configured' : 'Click to add trigger',
                hasSelectedTrigger: hasTrigger,
            },
            position: { x: 250, y: 50 },
            draggable: !isPreviewMode,
        });

        if (hasTrigger) {
            // Add action nodes
            workflow.actions.forEach((action, index) => {
                const nodeId = `action-${index}`;
                const status = validateAction(action);

                newNodes.push({
                    id: nodeId,
                    type: action.type === 'condition' ? 'condition' : 'action',
                    data: {
                        label: action.type.replace(/_/g, ' ').toUpperCase(),
                        description: action.description || getActionDescription(action.type),
                        status,
                        actionType: action.type,
                        condition: action.type === 'condition' ? getConditionSummary(action) : undefined,
                    },
                    position: { x: 250, y: (index + 1) * 180 + 50 },
                    draggable: !isPreviewMode,
                });

                // Connect to previous node
                const sourceId = index === 0 ? 'trigger' : `action-${index - 1}`;
                newEdges.push({
                    id: `edge-${sourceId}-${nodeId}`,
                    source: sourceId,
                    target: nodeId,
                    type: 'smoothstep',
                    style: {
                        stroke: '#6b7280',
                        strokeWidth: 2,
                        strokeDasharray: '5,5',
                    },
                    animated: true,
                });
            });

            // Add "+" node for adding new actions
            const addActionNodeId = 'add-action';
            newNodes.push({
                id: addActionNodeId,
                type: 'action',
                data: {
                    isAddButton: true,
                    label: 'Add Action',
                },
                position: { x: 250, y: (workflow.actions.length + 1) * 180 + 50 },
                draggable: !isPreviewMode,
            });

            // Connect last action to "+" node
            if (workflow.actions.length > 0) {
                newEdges.push({
                    id: `edge-action-${workflow.actions.length - 1}-${addActionNodeId}`,
                    source: `action-${workflow.actions.length - 1}`,
                    target: addActionNodeId,
                    type: 'smoothstep',
                    style: {
                        stroke: '#d1d5db',
                        strokeWidth: 2,
                        strokeDasharray: '2,2',
                    },
                });
            } else {
                newEdges.push({
                    id: 'edge-trigger-add-action',
                    source: 'trigger',
                    target: addActionNodeId,
                    type: 'smoothstep',
                    style: {
                        stroke: '#d1d5db',
                        strokeWidth: 2,
                        strokeDasharray: '2,2',
                    },
                });
            }
        }

        setNodes(newNodes);
        setEdges(newEdges);
    }, [workflow, hasTrigger, isPreviewMode, setNodes, setEdges]);

    useEffect(() => {
        buildFlow();
    }, [buildFlow]);

    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges((eds) => addEdge(connection, eds));
        },
        [setEdges],
    );

    const handleNodeClick = useCallback(
        (_: any, node: CustomNode) => {
            if (isPreviewMode) return;

            const nodeId = node.id;

            if (nodeId === 'trigger') {
                setSelectedNodeId(nodeId);
                setSelectedNodeType('trigger');
                setIsSidebarOpen(true);
            } else if (nodeId === 'add-action') {
                setSelectedNodeId(nodeId);
                setSelectedNodeType('action');
                setIsSidebarOpen(true);
            } else if (nodeId.startsWith('action-')) {
                setSelectedNodeId(nodeId);
                setSelectedNodeType('action');
                setIsSidebarOpen(true);
            }
        },
        [isPreviewMode],
    );

    const handleTriggerSelect = useCallback((trigger: Trigger) => {
        const updatedWorkflow = { ...workflow, trigger };
        setWorkflow(updatedWorkflow);
        onUpdate(updatedWorkflow);
        setIsSidebarOpen(false);
        setError(null);
        onClearMessages();
    }, [workflow, onUpdate, onClearMessages]);

    const handleActionSelect = useCallback(
        (action: Action) => {
            let updatedWorkflow: Workflow;
            
            if (selectedNodeId === 'add-action') {
                updatedWorkflow = {
                    ...workflow,
                    actions: [...workflow.actions, action],
                };
            } else if (selectedNodeId?.startsWith('action-')) {
                const actionIndex = parseInt(selectedNodeId.split('-')[1], 10);
                updatedWorkflow = {
                    ...workflow,
                    actions: workflow.actions.map((a, i) => (i === actionIndex ? action : a)),
                };
            } else {
                return;
            }
            
            setWorkflow(updatedWorkflow);
            onUpdate(updatedWorkflow);
            setIsSidebarOpen(false);
            setError(null);
            onClearMessages();
        },
        [selectedNodeId, workflow, onUpdate, onClearMessages],
    );

    const updateBasicInfo = useCallback((updates: Partial<Workflow>) => {
        const updatedWorkflow = { ...workflow, ...updates };
        setWorkflow(updatedWorkflow);
        onUpdate(updatedWorkflow);
        onClearMessages();
    }, [workflow, onUpdate, onClearMessages]);

    const handleSave = useCallback(async () => {
        if (!workflow.trigger.type) {
            setError('Please configure a trigger first');
            return;
        }

        // Validate workflow
        const validation = validateWorkflow(workflow);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            return;
        }

        setValidationErrors([]);
        setError(null);

        try {
            const success = await onSave(workflow);
            if (success) {
                onUpdate(workflow);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to save workflow');
        }
    }, [workflow, onSave, onUpdate]);

    const workflowStats = useMemo(() => {
        const total = workflow.actions.length;
        const configured = workflow.actions.filter((action) => validateAction(action) === 'configured').length;
        const incomplete = workflow.actions.filter((action) => validateAction(action) === 'incomplete').length;

        return { total, configured, incomplete };
    }, [workflow.actions]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                        <WorkflowIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold">
                                {workflow.name || 'Untitled Workflow'}
                            </h2>
                            {workflow.id && (
                                <Badge variant="outline" className="text-xs">
                                    #{workflow.id}
                                </Badge>
                            )}
                        </div>
                        {workflow.description && (
                            <p className="text-sm text-gray-600">{workflow.description}</p>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBasicInfo(!showBasicInfo)}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                    
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Close
                    </Button>
                    
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Basic Info Panel */}
            {showBasicInfo && (
                <div className="border-b bg-gray-50 p-4">
                    <div className="max-w-2xl space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Workflow Name *</Label>
                                <Input
                                    id="name"
                                    value={workflow.name}
                                    onChange={(e) => updateBasicInfo({ name: e.target.value })}
                                    placeholder="Enter workflow name..."
                                    className="mt-1"
                                />
                            </div>
                            
                            <div className="flex items-end">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={workflow.is_active}
                                        onCheckedChange={(checked) => updateBasicInfo({ is_active: checked })}
                                    />
                                    <Label htmlFor="is_active">Active</Label>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={workflow.description || ''}
                                onChange={(e) => updateBasicInfo({ description: e.target.value })}
                                placeholder="Describe what this workflow does..."
                                className="mt-1"
                                rows={2}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
                <div className="border-b bg-red-50 p-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="space-y-1">
                                <p className="font-medium">Please fix the following errors:</p>
                                <ul className="text-sm space-y-1">
                                    {validationErrors.map((error, index) => (
                                        <li key={index}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Main Flow Area */}
            <div className="flex-1 relative bg-gradient-to-br from-slate-50 to-blue-50">
                {/* Toolbar */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <Card className="bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <span>{workflowStats.configured} Configured</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                <span>{workflowStats.incomplete} Incomplete</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                <span>{workflowStats.total} Total Actions</span>
                            </div>
                        </div>
                    </Card>

                    <Button
                        variant={isPreviewMode ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className="bg-white/90 shadow-lg backdrop-blur-sm"
                    >
                        {isPreviewMode ? <Edit3 className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                        {isPreviewMode ? 'Edit' : 'Preview'}
                    </Button>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.3}
                    maxZoom={1.5}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                    className="workflow-builder"
                >
                    <Background color="#e2e8f0" gap={20} size={1} variant={BackgroundVariant.Lines} />
                    <Controls showInteractive={false} className="rounded-lg border bg-white shadow-lg" />
                    <MiniMap nodeColor="#6366f1" maskColor="rgba(0, 0, 0, 0.1)" className="rounded-lg border bg-white shadow-lg" />
                </ReactFlow>

                {/* Sidebar */}
                {isSidebarOpen && (
                    <div className="absolute right-0 top-0 bottom-0 w-[32rem] max-w-[90vw] border-l border-gray-200 bg-white shadow-xl">
                        {selectedNodeType === 'trigger' && (
                            <TriggerSelector
                                selectedTrigger={workflow.trigger}
                                onChange={handleTriggerSelect}
                                onClose={() => setIsSidebarOpen(false)}
                            />
                        )}
                        {selectedNodeType === 'action' && (
                            <ActionSelector
                                action={
                                    selectedNodeId?.startsWith('action-') 
                                        ? workflow.actions[parseInt(selectedNodeId.split('-')[1], 10)] 
                                        : undefined
                                }
                                onChange={handleActionSelect}
                                onClose={() => setIsSidebarOpen(false)}
                            />
                        )}
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="absolute right-4 bottom-4 w-96 shadow-lg">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <style>{`
                    .workflow-builder .react-flow__node {
                        cursor: pointer;
                    }
                    .workflow-builder .react-flow__edge {
                        cursor: default;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default WorkflowBuilder;
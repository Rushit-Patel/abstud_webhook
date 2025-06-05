// src/components/automation/WorkflowBuilder.tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Action, Trigger, Workflow } from '@/types/automation';
import { 
    addEdge, 
    Background, 
    Connection, 
    Controls, 
    Edge, 
    Handle, 
    Node, 
    Position, 
    ReactFlow, 
    useEdgesState, 
    useNodesState,
    NodeChange,
    EdgeChange,
    XYPosition,
    NodeProps,
    EdgeProps
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import ActionSelector from './ActionSelector';
import TriggerSelector from '@/components/Workflow/TriggerSelector';

interface WorkflowBuilderProps {
    initialWorkflow?: Workflow;
    onSave: (workflow: Workflow) => void;
}

type CustomNodeData = {
    label: string;
    description?: string;
    condition?: string;
    isAddButton?: boolean;
    isEnd?: boolean;
    hasSelectedTrigger?: boolean;
};

type CustomNode = Node<CustomNodeData>;
type CustomEdge = Edge;

interface BranchResult {
    nodes: CustomNode[];
    edges: CustomEdge[];
    maxY: number;
    endNodeIds: string[];
}

const IfElseNode = ({ data, id, isConnectable }: NodeProps<Node<CustomNodeData>>) => {
    return (
        <div className="relative group">
            <Handle 
                type="target" 
                position={Position.Top} 
                isConnectable={isConnectable}
            />
            <div className="workflow-node workflow-node-ifelse">
                <div className="flex items-center space-x-3">
                    <div className="workflow-node-icon">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="workflow-node-title">{data.label}</div>
                        {data.condition && (
                            <div className="workflow-node-description">
                                {data.condition}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Handle 
                type="source" 
                position={Position.Bottom} 
                id="yes" 
                isConnectable={isConnectable} 
                style={{ left: '25%' }}
            />
            <Handle 
                type="source" 
                position={Position.Bottom} 
                id="no" 
                isConnectable={isConnectable} 
                style={{ left: '75%' }}
            />
            <div className="workflow-branch-label workflow-branch-label-yes">YES</div>
            <div className="workflow-branch-label workflow-branch-label-no">NO</div>
        </div>
    );
};

const ActionNode = ({ data, isConnectable }: NodeProps<Node<CustomNodeData>>) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="relative group">
                        <Handle 
                            type="target" 
                            position={Position.Top} 
                            isConnectable={isConnectable}
                        />
                        {data.isAddButton ? (
                            <div className="workflow-node-add cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                                <div className="rounded-full bg-gray-100 p-2">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <div className="workflow-node workflow-node-action">
                                <div className="flex items-center space-x-3">
                                    <div className="workflow-node-icon">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="workflow-node-title">{data.label}</div>
                                        {data.description && (
                                            <div className="workflow-node-description">
                                                {data.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {!data.isAddButton && (
                            <Handle 
                                type="source" 
                                position={Position.Bottom} 
                                isConnectable={isConnectable}
                            />
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 text-white px-3 py-2">
                    {data.isAddButton ? 'Add a new action' : 'Click to edit action'}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const TriggerNode = ({ data, isConnectable }: NodeProps<Node<CustomNodeData>>) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="relative border-dashed border-2 p-2 border-gray-200 rounded-md group">
                        <div className={`workflow-node ${!data.hasSelectedTrigger ? 'workflow-node-empty' : 'workflow-node-trigger'}`}>
                            <div className="flex items-center space-x-3">
                                <div className={`workflow-node-icon ${!data.hasSelectedTrigger ? 'bg-gray-100' : 'bg-blue-100'}`}>
                                    {!data.hasSelectedTrigger ? (
                                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <div className={`workflow-node-title ${!data.hasSelectedTrigger ? 'text-gray-600' : 'text-blue-600'}`}>
                                        {data.label}
                                    </div>
                                    {data.description && (
                                        <div className={`workflow-node-description ${!data.hasSelectedTrigger ? 'text-gray-400' : 'text-blue-400'}`}>
                                            {data.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {(data.hasSelectedTrigger || data.isAddButton) && (
                            <Handle 
                                type="source" 
                                position={Position.Bottom} 
                                isConnectable={isConnectable}
                            />
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 text-white px-3 py-2">
                    {!data.hasSelectedTrigger ? 'Add a new trigger' : 'Click to edit trigger'}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
    ifelse: (props: NodeProps<Node<CustomNodeData>>) => <IfElseNode {...props} />
};

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ initialWorkflow, onSave }) => {
    const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow || { name: '', is_active: true, trigger: { type: '' }, actions: [] });
    const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedNodeType, setSelectedNodeType] = useState<'trigger' | 'action' | null>(null);
    const [selectedPath, setSelectedPath] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    const hasTrigger = workflow.trigger.type !== '';

    const buildBranch = useCallback(
        (actions: Action[], parentNodeId: string, baseX: number, startY: number, path: string[], branchType?: 'yes' | 'no'): BranchResult => {
            let currentY = startY;
            let lastNodeId = parentNodeId;
            const branchNodes: CustomNode[] = [];
            const branchEdges: CustomEdge[] = [];
            const endNodeIds: string[] = [];

            actions.forEach((action, index) => {
                const nodeId = `${path.join('-')}-${index}`;
                currentY += 160;

                if (action.type === 'if_else') {
                    const conditionLabel = action.conditions?.[0]
                        ? `${action.conditions[0].type.replace(/_/g, ' ')}: ${action.conditions[0].value}`
                        : 'No condition set';
                    branchNodes.push({
                        id: nodeId,
                        type: 'ifelse',
                        data: { label: 'IF/ELSE', condition: conditionLabel },
                        position: { x: baseX, y: currentY },
                        draggable: !isPreviewMode,
                    });

                    const edgeId = branchType ? `e-${lastNodeId}-${nodeId}-${branchType}` : `e-${lastNodeId}-${nodeId}`;
                    branchEdges.push({
                        id: edgeId,
                        source: lastNodeId,
                        target: nodeId,
                        sourceHandle: branchType || undefined,
                        style: { 
                            stroke: branchType === 'yes' ? '#22c55e' : '#ef4444',
                            strokeWidth: 2,
                            opacity: 0.75
                        },
                    });

                    const yesPath = [...path, index.toString(), 'yes'];
                    const yesResult = buildBranch(action.yesActions || [], nodeId, baseX - 320, currentY + 120, yesPath, 'yes');
                    
                    branchNodes.push(...yesResult.nodes);
                    branchEdges.push(...yesResult.edges);

                    const yesAddNodeId = `${yesPath.join('-')}-add`;
                    const yesAddY = yesResult.maxY + 120;
                    branchNodes.push({
                        id: yesAddNodeId,
                        type: 'action',
                        data: { label: '+ Add Action', isAddButton: true },
                        position: { x: baseX - 320, y: yesAddY },
                        draggable: !isPreviewMode,
                    });

                    if (yesResult.endNodeIds.length > 0) {
                        yesResult.endNodeIds.forEach((endNodeId: string) => {
                            branchEdges.push({ 
                                id: `e-${endNodeId}-${yesAddNodeId}`, 
                                source: endNodeId, 
                                target: yesAddNodeId,
                                style: { strokeWidth: 2, opacity: 0.75 }
                            });
                        });
                    } else {
                        branchEdges.push({
                            id: `e-${nodeId}-${yesAddNodeId}-yes`,
                            source: nodeId,
                            target: yesAddNodeId,
                            sourceHandle: 'yes',
                            style: { stroke: '#22c55e', strokeWidth: 2, opacity: 0.75 },
                        });
                    }

                    const noPath = [...path, index.toString(), 'no'];
                    const noResult = buildBranch(action.noActions || [], nodeId, baseX + 320, currentY + 120, noPath, 'no');
                    branchNodes.push(...noResult.nodes);
                    branchEdges.push(...noResult.edges);

                    const noAddNodeId = `${noPath.join('-')}-add`;
                    const noAddY = noResult.maxY + 120;
                    branchNodes.push({
                        id: noAddNodeId,
                        type: 'action',
                        data: { label: '+ Add Action', isAddButton: true },
                        position: { x: baseX + 320, y: noAddY },
                        draggable: !isPreviewMode,
                    });

                    if (noResult.endNodeIds.length > 0) {
                        noResult.endNodeIds.forEach((endNodeId) => {
                            branchEdges.push({ 
                                id: `e-${endNodeId}-${noAddNodeId}`, 
                                source: endNodeId, 
                                target: noAddNodeId,
                                style: { strokeWidth: 2, opacity: 0.75 }
                            });
                        });
                    } else {
                        branchEdges.push({
                            id: `e-${nodeId}-${noAddNodeId}-no`,
                            source: nodeId,
                            target: noAddNodeId,
                            sourceHandle: 'no',
                            style: { stroke: '#ef4444', strokeWidth: 2, opacity: 0.75 },
                        });
                    }

                    currentY = Math.max(yesAddY, noAddY);
                    lastNodeId = nodeId;
                } else {
                    branchNodes.push({
                        id: nodeId,
                        type: 'action',
                        data: { 
                            label: action.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            description: action.description || undefined
                        },
                        position: { x: baseX, y: currentY },
                        draggable: !isPreviewMode,
                    });

                    const edgeId = branchType ? `e-${lastNodeId}-${nodeId}-${branchType}` : `e-${lastNodeId}-${nodeId}`;
                    branchEdges.push({
                        id: edgeId,
                        source: lastNodeId,
                        target: nodeId,
                        sourceHandle: branchType || undefined,
                        style: { 
                            stroke: branchType === 'yes' ? '#22c55e' : branchType === 'no' ? '#ef4444' : '#94a3b8',
                            strokeWidth: 2,
                            opacity: 0.75
                        },
                    });

                    lastNodeId = nodeId;
                    endNodeIds.push(nodeId);
                }
            });

            return { nodes: branchNodes, edges: branchEdges, maxY: currentY, endNodeIds };
        },
        [isPreviewMode]
    );

    const buildFlow = useCallback(() => {
        const newNodes: CustomNode[] = [];
        const newEdges: CustomEdge[] = [];

        // Add trigger node
        newNodes.push({
            id: 'trigger',
            type: 'trigger',
            data: { 
                label: hasTrigger ? workflow.trigger.type.replace(/_/g, ' ').toUpperCase() : 'Add New Trigger',
                description: hasTrigger ? 'Click to edit trigger settings' : 'Start your workflow by adding a trigger',
                hasSelectedTrigger: hasTrigger
            },
            position: { x: 250, y: 50 },
            draggable: true
        });

        if (hasTrigger) {
            // Add action nodes
            workflow.actions.forEach((action, index) => {
                const nodeId = `action-${index}`;
                newNodes.push({
                    id: nodeId,
                    type: 'action',
                    data: { 
                        label: action.type.replace(/_/g, ' ').toUpperCase(),
                        description: action.description || 'Click to edit action'
                    },
                    position: { x: 250, y: (index + 1) * 150 + 50 },
                    draggable: true
                });

                // Connect to previous node
                const sourceId = index === 0 ? 'trigger' : `action-${index - 1}`;
                newEdges.push({
                    id: `edge-${sourceId}-${nodeId}`,
                    source: sourceId,
                    target: nodeId,
                    type: 'smoothstep',
                    style: { stroke: '#94a3b8', strokeWidth: 2 }
                });
            });

            // Add "+" node for adding new actions
            const addActionNodeId = 'add-action';
            newNodes.push({
                id: addActionNodeId,
                type: 'action',
                data: { 
                    isAddButton: true,
                    label: 'Add Action'
                },
                position: { x: 250, y: (workflow.actions.length + 1) * 150 + 50 },
                draggable: true
            });

            // Connect last action to "+" node
            if (workflow.actions.length > 0) {
                newEdges.push({
                    id: `edge-action-${workflow.actions.length - 1}-${addActionNodeId}`,
                    source: `action-${workflow.actions.length - 1}`,
                    target: addActionNodeId,
                    type: 'smoothstep',
                    style: { stroke: '#94a3b8', strokeWidth: 2 }
                });
            } else {
                newEdges.push({
                    id: 'edge-trigger-add-action',
                    source: 'trigger',
                    target: addActionNodeId,
                    type: 'smoothstep',
                    style: { stroke: '#94a3b8', strokeWidth: 2 }
                });
            }
        }

        setNodes(newNodes);
        setEdges(newEdges);
    }, [workflow, hasTrigger, setNodes, setEdges]);

    useEffect(() => {
        buildFlow();
    }, [buildFlow]);

    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges((eds) =>
                addEdge(
                    {
                        ...connection,
                        style: {
                            strokeWidth: 2,
                            opacity: 0.75,
                            stroke: connection.sourceHandle === 'yes' ? '#22c55e' : connection.sourceHandle === 'no' ? '#ef4444' : '#94a3b8',
                        },
                    },
                    eds
                )
            );
        },
        []
    );

    const handleNodeClick = (_: any, node: CustomNode) => {
        if (isPreviewMode) return;
        const nodeId = node.id;

        if (nodeId === 'trigger') {
            setSelectedNodeId(nodeId);
            setSelectedNodeType('trigger');
            setSelectedPath([]);
            setIsSidebarOpen(true);
        } else if (nodeId.endsWith('-add')) {
            setSelectedNodeId(nodeId);
            setSelectedNodeType('action');
            const pathParts = nodeId.split('-').slice(0, -1);
            setSelectedPath(pathParts);
            setIsSidebarOpen(true);
        } else if (nodeId !== 'end') {
            setSelectedNodeId(nodeId);
            setSelectedNodeType('action');
            const pathParts = nodeId.split('-');
            setSelectedPath(pathParts.slice(0, -1));
            setIsSidebarOpen(true);
        }
    };

    const handleDeleteNode = (nodeId: string) => {
        if (isPreviewMode || nodeId === 'trigger' || nodeId === 'end') return;
        if (confirm('Are you sure you want to delete this action?')) {
            const pathParts = nodeId.split('-');
            const path = pathParts.slice(0, -1);
            const actionIndex = parseInt(pathParts[pathParts.length - 1], 10);

            let newActions = [...workflow.actions];
            let currentActions = newActions;

            if (path.length === 1 && path[0] === 'main') {
                newActions = newActions.filter((_, i) => i !== actionIndex);
            } else {
                for (let i = 1; i < path.length; i += 2) {
                    const parentIndex = parseInt(path[i], 10);
                    const branchType = path[i + 1];
                    const branchKey = branchType === 'yes' ? 'yesActions' : 'noActions';
                    if (i + 2 >= path.length) {
                        const currentAction = currentActions[parentIndex];
                        if (currentAction && currentAction[branchKey]) {
                            currentAction[branchKey] = currentAction[branchKey]!.filter((_, j) => j !== actionIndex);
                        }
                        break;
                    }
                    const nextAction = currentActions[parentIndex];
                    if (nextAction && nextAction[branchKey]) {
                        currentActions = nextAction[branchKey]!;
                    }
                }
            }

            setWorkflow({ ...workflow, actions: newActions });
            setNodes((nds) => nds.filter((n) => n.id !== nodeId));
            setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
        }
    };

    const updateActionsAtPath = (actions: Action[], path: string[], newAction: Action): Action[] => {
        if (path.length === 1 && path[0] === 'main') {
            if (selectedNodeId?.endsWith('-add')) {
                return [...actions, newAction];
            }
            const actionIndex = parseInt(selectedNodeId?.split('-').pop() || '0', 10);
            const newActions = [...actions];
            newActions[actionIndex] = newAction;
            return newActions;
        }

        const newActions = [...actions];
        let currentActions: Action[] = newActions;

        for (let i = 1; i < path.length; i += 2) {
            const actionIndex = parseInt(path[i], 10);
            const branchType = path[i + 1];

            if (i + 2 >= path.length) {
                const branchKey = branchType === 'yes' ? 'yesActions' : 'noActions';
                if (selectedNodeId?.endsWith('-add')) {
                    const currentAction = currentActions[actionIndex];
                    if (currentAction) {
                        currentAction[branchKey] = [...(currentAction[branchKey] || []), newAction];
                    }
                } else {
                    const branchIndex = parseInt(selectedNodeId?.split('-').pop() || '0', 10);
                    const currentAction = currentActions[actionIndex];
                    if (currentAction && currentAction[branchKey]) {
                        const branchActions = [...currentAction[branchKey]!];
                        branchActions[branchIndex] = newAction;
                        currentAction[branchKey] = branchActions;
                    }
                }
                break;
            } else {
                const branchKey = branchType === 'yes' ? 'yesActions' : 'noActions';
                const currentAction = currentActions[actionIndex];
                if (currentAction) {
                    if (!currentAction[branchKey]) {
                        currentAction[branchKey] = [];
                    }
                    currentActions = currentAction[branchKey]!;
                }
            }
        }

        return newActions;
    };

    const getActionAtPath = (workflow: Workflow, path: string[]): Action | undefined => {
        if (path.length === 1 && path[0] === 'main') {
            const actionIndex = parseInt(selectedNodeId?.split('-').pop() || '0', 10);
            return workflow.actions[actionIndex];
        }

        let currentActions: Action[] = workflow.actions;

        for (let i = 1; i < path.length; i += 2) {
            const actionIndex = parseInt(path[i], 10);
            const branchType = path[i + 1];
            const branchKey = branchType === 'yes' ? 'yesActions' : 'noActions';

            if (i + 2 >= path.length) {
                const branchIndex = parseInt(selectedNodeId?.split('-').pop() || '0', 10);
                const currentAction = currentActions[actionIndex];
                return currentAction?.[branchKey]?.[branchIndex];
            }

            const currentAction = currentActions[actionIndex];
            if (currentAction && currentAction[branchKey]) {
                currentActions = currentAction[branchKey]!;
            } else {
                return undefined;
            }
        }

        return undefined;
    };

    const validateWorkflow = (): string | null => {
        if (!workflow.trigger.type) return 'Trigger is required';
        // Add validation for other trigger types and actions (as in original)
        return null;
    };

    const handleTriggerSelect = (trigger: Trigger) => {
        setWorkflow({ ...workflow, trigger });
        setIsSidebarOpen(false);
        setError(null);
    };

    const handleActionSelect = (action: Action) => {
        const newActions = updateActionsAtPath(workflow.actions, selectedPath, action);
        setWorkflow({ ...workflow, actions: newActions });
        setIsSidebarOpen(false);
        setError(null);
    };

    const handleAddTrigger = () => {
        setSelectedNodeType('trigger');
        setIsSidebarOpen(true);
    };

    const handleAddAction = () => {
        setSelectedNodeType('action');
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedNodeType(null);
        setSelectedNodeId(null);
    };

    const handleSave = async () => {
        const validationError = validateWorkflow();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            await axios.post('/api/workflows', workflow, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onSave(workflow);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save workflow');
        }
    };

    return (
        <div className="h-full bg-white">
            <div className="flex h-full">
                {/* Main Flow Area */}
                <div className="flex-1 h-full">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={handleNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                        minZoom={0.5}
                        maxZoom={2}
                        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                    >
                        <Background color="#94a3b8" gap={16} size={1} />
                        <Controls />
                    </ReactFlow>
                </div>

                {/* Sidebar */}
                {isSidebarOpen && (
                    <div className="w-96 border-l border-gray-200">
                        {selectedNodeType === 'trigger' && (
                            <TriggerSelector
                                selectedTrigger={workflow.trigger}
                                onChange={handleTriggerSelect}
                                onClose={handleCloseSidebar}
                            />
                        )}
                        {selectedNodeType === 'action' && (
                            <ActionSelector
                                action={selectedNodeId && selectedNodeId !== 'add-action' ? 
                                    workflow.actions[parseInt(selectedNodeId.split('-')[1], 10)] : 
                                    undefined}
                                onChange={handleActionSelect}
                                onClose={handleCloseSidebar}
                            />
                        )}
                    </div>
                )}
            </div>

            {error && (
                <Alert variant="destructive" className="fixed bottom-4 right-4 w-96">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default WorkflowBuilder;

// Add these styles to your CSS
const styles = `
.workflow-node {
    @apply p-4 rounded-lg border transition-colors duration-200;
}

.workflow-node-empty {
    @apply bg-white border-gray-200 hover:border-gray-300;
}

.workflow-node-trigger {
    @apply bg-blue-50 border-blue-200 hover:bg-blue-100;
}

.workflow-node-action {
    @apply bg-gray-50 border-gray-200 hover:bg-gray-100;
}

.workflow-node-add {
    @apply flex items-center justify-center w-12 h-12 rounded-full border-2 border-dashed border-gray-300;
}

.workflow-node-icon {
    @apply p-2 rounded-md;
}

.workflow-node-title {
    @apply font-medium;
}

.workflow-node-description {
    @apply text-sm;
}
`;
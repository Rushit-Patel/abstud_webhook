import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Node, 
  Edge, 
  Connection,
  useNodesState, 
  useEdgesState,
  addEdge,
  Position,
  Handle,
  NodeProps,
  MiniMap,
  BackgroundVariant
} from '@xyflow/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Eye, Edit3, AlertTriangle, CheckCircle } from 'lucide-react';
import { Action, Trigger, Workflow } from '@/types/automation';
import ActionSelector from './ActionSelector';
import TriggerSelector from './TriggerSelector';
import axios from 'axios';
import '@xyflow/react/dist/style.css';

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
          <div className="relative group">
            <div className={`
              workflow-node px-4 py-3 rounded-xl border-2 shadow-lg transition-all duration-200
              ${isConfigured 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300' 
                : 'bg-gradient-to-r from-gray-50 to-slate-50 border-dashed border-gray-300 hover:border-gray-400'
              }
            `}>
              <div className="flex items-center gap-3">
                <div className={`
                  p-2 rounded-lg transition-colors
                  ${isConfigured ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}
                `}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div>
                  <div className={`font-medium ${isConfigured ? 'text-blue-900' : 'text-gray-600'}`}>
                    {data.label}
                  </div>
                  {data.description && (
                    <div className={`text-sm ${isConfigured ? 'text-blue-600' : 'text-gray-500'}`}>
                      {data.description}
                    </div>
                  )}
                </div>
                {isConfigured && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
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
                className="w-3 h-3 border-2 border-blue-400 bg-blue-200"
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
      case 'configured': return 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50';
      case 'incomplete': return 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50';
      case 'error': return 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50';
      default: return 'border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50';
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
                className="w-3 h-3 border-2 border-gray-400 bg-gray-200"
              />
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center group-hover:scale-110">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="relative group">
            <Handle 
              type="target" 
              position={Position.Top} 
              isConnectable={isConnectable}
              className="w-3 h-3 border-2 border-gray-400 bg-gray-200"
            />
            
            <div className={`
              workflow-node px-4 py-3 rounded-xl border-2 shadow-lg transition-all duration-200 hover:shadow-xl
              ${getStatusColor()}
            `}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  status === 'configured' ? 'bg-green-100 text-green-600' :
                  status === 'incomplete' ? 'bg-yellow-100 text-yellow-600' :
                  status === 'error' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{data.label}</div>
                  {data.description && (
                    <div className="text-sm text-gray-600">{data.description}</div>
                  )}
                </div>
                <Badge variant={
                  status === 'configured' ? 'default' : 
                  status === 'incomplete' ? 'secondary' : 
                  'destructive'
                } className="text-xs">
                  {status === 'configured' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {status === 'incomplete' && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
            </div>
            
            <Handle 
              type="source" 
              position={Position.Bottom} 
              isConnectable={isConnectable}
              className="w-3 h-3 border-2 border-gray-400 bg-gray-200"
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
    <div className="relative group">
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-purple-400 bg-purple-200"
      />
      
      <div className="workflow-node px-4 py-3 rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 shadow-lg hover:shadow-xl transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-medium text-purple-900">{data.label}</div>
            {data.condition && (
              <div className="text-sm text-purple-600 mt-1 p-2 bg-purple-100 rounded">
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
        className="w-3 h-3 border-2 border-green-400 bg-green-200"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="no" 
        isConnectable={isConnectable} 
        style={{ left: '75%' }}
        className="w-3 h-3 border-2 border-red-400 bg-red-200"
      />
      
      <div className="absolute -bottom-8 left-1/4 transform -translate-x-1/2">
        <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
          YES
        </Badge>
      </div>
      <div className="absolute -bottom-8 left-3/4 transform -translate-x-1/2">
        <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">
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

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ initialWorkflow, onSave }) => {
  const [workflow, setWorkflow] = useState<Workflow>(
    initialWorkflow || { 
      name: '', 
      is_active: true, 
      trigger: { type: '' }, 
      actions: [] 
    }
  );
  
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<'trigger' | 'action' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hasTrigger = workflow.trigger.type !== '';

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
        hasSelectedTrigger: hasTrigger
      },
      position: { x: 250, y: 50 },
      draggable: !isPreviewMode
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
            condition: action.type === 'condition' ? getConditionSummary(action) : undefined
          },
          position: { x: 250, y: (index + 1) * 180 + 50 },
          draggable: !isPreviewMode
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
            strokeDasharray: '5,5'
          },
          animated: true
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
        position: { x: 250, y: (workflow.actions.length + 1) * 180 + 50 },
        draggable: !isPreviewMode
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
            strokeDasharray: '2,2'
          }
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
            strokeDasharray: '2,2'
          }
        });
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [workflow, hasTrigger, isPreviewMode, setNodes, setEdges]);

  const validateAction = (action: Action): 'configured' | 'incomplete' | 'error' => {
    if (!action.type) return 'error';
    
    switch (action.type) {
      case 'send_email':
        return (action.to && action.subject) ? 'configured' : 'incomplete';
      case 'send_webhook':
        return action.webhookUrl ? 'configured' : 'incomplete';
      case 'condition':
        return (action.conditions && action.conditions.length > 0) ? 'configured' : 'incomplete';
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

  useEffect(() => {
    buildFlow();
  }, [buildFlow]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const handleNodeClick = useCallback((_: any, node: CustomNode) => {
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
  }, [isPreviewMode]);

  const handleTriggerSelect = useCallback((trigger: Trigger) => {
    setWorkflow(prev => ({ ...prev, trigger }));
    setIsSidebarOpen(false);
    setError(null);
  }, []);

  const handleActionSelect = useCallback((action: Action) => {
    if (selectedNodeId === 'add-action') {
      setWorkflow(prev => ({
        ...prev,
        actions: [...prev.actions, action]
      }));
    } else if (selectedNodeId?.startsWith('action-')) {
      const actionIndex = parseInt(selectedNodeId.split('-')[1], 10);
      setWorkflow(prev => ({
        ...prev,
        actions: prev.actions.map((a, i) => i === actionIndex ? action : a)
      }));
    }
    setIsSidebarOpen(false);
    setError(null);
  }, [selectedNodeId]);

  const handleSave = useCallback(async () => {
    if (!workflow.trigger.type) {
      setError('Please configure a trigger first');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(workflow);
    } catch (err: any) {
      setError(err.message || 'Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  }, [workflow, onSave]);

  const workflowStats = useMemo(() => {
    const total = workflow.actions.length;
    const configured = workflow.actions.filter(action => validateAction(action) === 'configured').length;
    const incomplete = workflow.actions.filter(action => validateAction(action) === 'incomplete').length;
    
    return { total, configured, incomplete };
  }, [workflow.actions]);

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex h-full">
        {/* Main Flow Area */}
        <div className="flex-1 h-full relative">
          {/* Toolbar */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <Card className="px-3 py-2 shadow-lg backdrop-blur-sm bg-white/90">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>{workflowStats.configured} Configured</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>{workflowStats.incomplete} Incomplete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>{workflowStats.total} Total Actions</span>
                </div>
              </div>
            </Card>
            
            <Button
              variant={isPreviewMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="shadow-lg backdrop-blur-sm bg-white/90"
            >
              {isPreviewMode ? <Edit3 className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>
          </div>

          {/* Save Button */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasTrigger}
              className="shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Workflow
                </>
              )}
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
            <Background 
              color="#e2e8f0" 
              gap={20} 
              size={1} 
              variant={BackgroundVariant.Dots}
            />
            <Controls 
              showInteractive={false}
              className="bg-white shadow-lg rounded-lg border"
            />
            <MiniMap 
              nodeColor="#6366f1"
              maskColor="rgba(0, 0, 0, 0.1)"
              className="bg-white border rounded-lg shadow-lg"
            />
          </ReactFlow>
        </div>

        {/* Sidebar */}
        {isSidebarOpen && (
          <div className="w-96 border-l border-gray-200 bg-white shadow-xl">
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
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="fixed bottom-4 right-4 w-96 shadow-lg">
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
  );
};

export default WorkflowBuilder;
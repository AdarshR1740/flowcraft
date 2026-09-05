import React, { useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { nodeTypes } from './CustomNodes';
import { edgeTypes } from './CustomEdge';
import { NodeType, CustomNode, CustomEdge } from '../../types/workflow';
import { Sparkles } from 'lucide-react';

const WorkflowCanvasInner: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  useEffect(() => {
    const handleAutoLayout = () => {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 350 });
      }, 50);
    };
    window.addEventListener('flowcraft:auto-layout', handleAutoLayout);
    return () => window.removeEventListener('flowcraft:auto-layout', handleAutoLayout);
  }, [fitView]);

  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const mode = useWorkflowStore((state) => state.mode);
  const theme = useWorkflowStore((state) => state.theme);
  const onNodesChange = useWorkflowStore((state) => state.onNodesChange);
  const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange);
  const onConnect = useWorkflowStore((state) => state.onConnect);
  const setSelectedNodeId = useWorkflowStore((state) => state.setSelectedNodeId);
  const addNode = useWorkflowStore((state) => state.addNode);

  // Drag and drop from palette onto canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      try {
        const item = JSON.parse(rawData);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNode: CustomNode = {
          id: `${item.type}-${Date.now()}`,
          type: item.type as NodeType,
          position,
          data: { ...item.defaultData },
        };

        addNode(newNode);
      } catch (err) {
        console.error('Failed to parse dropped element', err);
      }
    },
    [screenToFlowPosition, addNode]
  );

  const isStructured = mode === 'structured';
  const isDark = theme === 'dark';

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-full relative bg-slate-50 dark:bg-[#090b10] transition-colors duration-200"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow<CustomNode, CustomEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        snapToGrid={isStructured}
        snapGrid={[16, 16]}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={
          isStructured ? ConnectionLineType.SmoothStep : ConnectionLineType.Bezier
        }
        connectionLineStyle={{
          stroke: isDark ? '#60a5fa' : '#3b82f6',
          strokeWidth: 2,
        }}
        defaultEdgeOptions={{
          type: isStructured ? 'smoothstep' : 'default',
        }}
        minZoom={0.2}
        maxZoom={2}
      >
        <Background
          variant={isStructured ? BackgroundVariant.Dots : BackgroundVariant.Lines}
          gap={isStructured ? 20 : 28}
          size={isStructured ? 1.5 : 1}
          color={isDark ? '#1e2433' : '#cbd5e1'}
        />
        <Controls showInteractive={false} className="!bottom-4 !left-4" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'event') return (n.data?.eventType === 'end' ? '#f43f5e' : '#10b981');
            if (n.type === 'decision') return '#f59e0b';
            if (n.type === 'system') return '#6366f1';
            if (n.type === 'sticky') return (n.data?.color as string) || '#fef08a';
            return isDark ? '#3b82f6' : '#2563eb';
          }}
          maskColor={isDark ? 'rgba(9, 11, 16, 0.75)' : 'rgba(248, 250, 252, 0.75)'}
          className="!bottom-4 !right-4"
        />
      </ReactFlow>

      {/* Floating Canvas Mode Indicator Badge */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5 shadow-sm dark:shadow-lg transition-colors">
          <span
            className={`w-2 h-2 rounded-full ${
              isStructured ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="capitalize font-medium">{mode} Canvas</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>{nodes.length} nodes</span>
        </div>
      </div>

      {/* Empty State Banner */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 select-none">
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#12151e]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-center max-w-sm shadow-sm dark:shadow-xl pointer-events-auto">
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Canvas is Clear
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Drag elements from the left palette to start mapping, or load a pre-built template from the top bar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const WorkflowCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
};

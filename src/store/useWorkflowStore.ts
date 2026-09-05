import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  EdgeChange,
  NodeChange,
  MarkerType,
} from '@xyflow/react';
import dagre from 'dagre';
import {
  CustomNode,
  CustomEdge,
  WorkflowMode,
  ThemeMode,
  WorkflowNodeData,
  WorkflowExportData,
} from '../types/workflow';
import { WORKFLOW_TEMPLATES } from '../data/templates';

const STORAGE_KEY = 'flowcraft_workflow_v1';
const THEME_KEY = 'flowcraft_theme_v1';

interface WorkflowState {
  title: string;
  description: string;
  mode: WorkflowMode;
  theme: ThemeMode;
  nodes: CustomNode[];
  edges: CustomEdge[];
  selectedNodeId: string | null;

  // React Flow integration
  onNodesChange: (changes: NodeChange<CustomNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<CustomEdge>[]) => void;
  onConnect: (connection: Connection) => void;

  // State actions
  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;
  setMode: (mode: WorkflowMode) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setSelectedNodeId: (id: string | null) => void;
  addNode: (node: CustomNode) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  loadTemplate: (templateId: string) => void;
  resetWorkflow: () => void;
  importWorkflow: (data: WorkflowExportData) => void;
  autoLayout: (direction?: 'TB' | 'LR') => void;
}

// Helper to determine node dimensions for dagre
const getNodeDimensions = (node: CustomNode, mode: WorkflowMode) => {
  if (node.measured?.width && node.measured?.height) {
    return { width: node.measured.width, height: node.measured.height };
  }
  const isFreeform = mode === 'freeform';
  switch (node.type) {
    case 'event':
      return { width: 140, height: 42 };
    case 'task':
      return isFreeform ? { width: 180, height: 56 } : { width: 230, height: 115 };
    case 'decision':
      return { width: 180, height: 85 };
    case 'system':
      return { width: 190, height: 75 };
    case 'sticky':
      return { width: 180, height: 110 };
    case 'note':
      return { width: 180, height: 65 };
    default:
      return { width: 180, height: 70 };
  }
};

// Initial state loaded from storage or default template
const loadInitialTheme = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (e) {
    console.warn('Failed to load theme from localStorage', e);
  }
  return 'dark';
};

const applyThemeToDocument = (theme: ThemeMode) => {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

const loadInitialState = () => {
  const initialTheme = loadInitialTheme();
  applyThemeToDocument(initialTheme);

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        title: parsed.title || 'Enterprise Workflow Map',
        description: parsed.description || '',
        mode: (parsed.mode as WorkflowMode) || 'freeform',
        theme: initialTheme,
        nodes: (parsed.nodes || []) as CustomNode[],
        edges: (parsed.edges || []) as CustomEdge[],
      };
    }
  } catch (e) {
    console.error('Failed to load workflow from localStorage', e);
  }

  // Fallback to default freeform template
  const defaultTemplate = WORKFLOW_TEMPLATES[0];
  return {
    title: defaultTemplate.name,
    description: defaultTemplate.description,
    mode: 'freeform' as WorkflowMode,
    theme: initialTheme,
    nodes: defaultTemplate.nodes,
    edges: defaultTemplate.edges,
  };
};

const saveToStorage = (state: {
  title: string;
  description: string;
  mode: WorkflowMode;
  nodes: CustomNode[];
  edges: CustomEdge[];
}) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        title: state.title,
        description: state.description,
        mode: state.mode,
        nodes: state.nodes,
        edges: state.edges,
      })
    );
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
};

const initial = loadInitialState();

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  title: initial.title,
  description: initial.description,
  mode: initial.mode,
  theme: initial.theme,
  nodes: initial.nodes,
  edges: initial.edges,
  selectedNodeId: null,

  onNodesChange: (changes: NodeChange<CustomNode>[]) => {
    set((state) => {
      const newNodes = applyNodeChanges<CustomNode>(changes, state.nodes);
      saveToStorage({ ...state, nodes: newNodes });
      return { nodes: newNodes };
    });
  },

  onEdgesChange: (changes: EdgeChange<CustomEdge>[]) => {
    set((state) => {
      const newEdges = applyEdgeChanges<CustomEdge>(changes, state.edges);
      saveToStorage({ ...state, edges: newEdges });
      return { edges: newEdges };
    });
  },

  onConnect: (connection) => {
    set((state) => {
      const isStructured = state.mode === 'structured';
      const edgeType = isStructured ? 'smoothstep' : 'default';
      const strokeColor = state.theme === 'dark' ? '#475569' : '#94a3b8';
      const newEdge: CustomEdge = {
        ...connection,
        id: `e-${connection.source}-${connection.sourceHandle || ''}-${connection.target}-${connection.targetHandle || ''}-${Date.now()}`,
        type: edgeType,
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: strokeColor,
        },
        style: {
          stroke: strokeColor,
          strokeWidth: 2,
        },
      };
      const newEdges = addEdge(newEdge, state.edges);
      saveToStorage({ ...state, edges: newEdges });
      return { edges: newEdges };
    });
  },

  setTitle: (title) => {
    set((state) => {
      saveToStorage({ ...state, title });
      return { title };
    });
  },

  setDescription: (description) => {
    set((state) => {
      saveToStorage({ ...state, description });
      return { description };
    });
  },

  setMode: (mode) => {
    set((state) => {
      const edgeType = mode === 'structured' ? 'smoothstep' : 'default';
      const updatedEdges = state.edges.map((edge) => ({
        ...edge,
        type: edgeType,
      }));
      saveToStorage({ ...state, mode, edges: updatedEdges });
      return { mode, edges: updatedEdges };
    });
  },

  setTheme: (theme) => {
    applyThemeToDocument(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme', e);
    }
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  setSelectedNodeId: (id) => {
    set({ selectedNodeId: id });
  },

  addNode: (node) => {
    set((state) => {
      const newNodes = [...state.nodes, node];
      saveToStorage({ ...state, nodes: newNodes });
      return { nodes: newNodes, selectedNodeId: node.id };
    });
  },

  updateNodeData: (id, partialData) => {
    set((state) => {
      const newNodes = state.nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...partialData,
            },
          };
        }
        return node;
      });
      saveToStorage({ ...state, nodes: newNodes });
      return { nodes: newNodes };
    });
  },

  deleteNode: (id) => {
    set((state) => {
      const newNodes = state.nodes.filter((node) => node.id !== id);
      const newEdges = state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      );
      const newSelectedId = state.selectedNodeId === id ? null : state.selectedNodeId;
      saveToStorage({ ...state, nodes: newNodes, edges: newEdges });
      return { nodes: newNodes, edges: newEdges, selectedNodeId: newSelectedId };
    });
  },

  deleteEdge: (id) => {
    set((state) => {
      const newEdges = state.edges.filter((edge) => edge.id !== id);
      saveToStorage({ ...state, edges: newEdges });
      return { edges: newEdges };
    });
  },

  loadTemplate: (templateId) => {
    const template = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    set(() => {
      const newState = {
        title: template.name,
        description: template.description,
        mode: template.mode,
        nodes: template.nodes,
        edges: template.edges,
        selectedNodeId: null,
      };
      saveToStorage(newState);
      return newState;
    });
  },

  resetWorkflow: () => {
    set(() => {
      const newState = {
        title: 'Untitled Workflow',
        description: '',
        mode: 'freeform' as WorkflowMode,
        nodes: [],
        edges: [],
        selectedNodeId: null,
      };
      saveToStorage(newState);
      return newState;
    });
  },

  importWorkflow: (data) => {
    set(() => {
      const anyData = data as unknown as Record<string, any>;
      const meta = data.meta || {};
      const mode = (meta.mode || anyData.mode || 'freeform') as WorkflowMode;
      const newState = {
        title: meta.title || anyData.title || 'Imported Workflow',
        description: meta.description || anyData.description || '',
        mode,
        nodes: data.nodes || anyData.nodes || [],
        edges: data.edges || anyData.edges || [],
        selectedNodeId: null,
      };
      saveToStorage(newState);
      return newState;
    });
  },

  autoLayout: (direction = 'LR') => {
    const { nodes, edges, mode } = get();
    if (nodes.length === 0) return;

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({
      rankdir: direction,
      nodesep: isHorizontal ? 70 : 80,
      ranksep: isHorizontal ? 100 : 90,
      marginx: 50,
      marginy: 50,
    });

    nodes.forEach((node) => {
      const dims = getNodeDimensions(node, mode);
      dagreGraph.setNode(node.id, { width: dims.width, height: dims.height });
    });

    // 1. Calculate topological ASAP depth from roots so parallel branches stay aligned to their fork point
    const inEdgesMap: Record<string, string[]> = {};
    edges.forEach((edge) => {
      inEdgesMap[edge.target] = inEdgesMap[edge.target] || [];
      inEdgesMap[edge.target].push(edge.source);
    });

    const asapDepth: Record<string, number> = {};
    nodes.forEach((n) => {
      if (!inEdgesMap[n.id] || inEdgesMap[n.id].length === 0) {
        asapDepth[n.id] = 0;
      }
    });

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 50) {
      changed = false;
      iterations++;
      edges.forEach((edge) => {
        const uDepth = asapDepth[edge.source] ?? 0;
        const vDepth = asapDepth[edge.target] ?? 0;
        if (uDepth + 1 > vDepth) {
          asapDepth[edge.target] = uDepth + 1;
          changed = true;
        }
      });
    }

    // 2. Set edge weights in Dagre:
    // Earlier edges get significantly higher weight than late-stage edges.
    // This forces network-simplex to keep parallel branches aligned to the fork node (ASAP)
    // rather than dragging them across empty space to the sink!
    edges.forEach((edge) => {
      const sourceDepth = asapDepth[edge.source] ?? 0;
      const weight = Math.max(1, 100 - sourceDepth * 6);
      dagreGraph.setEdge(edge.source, edge.target, { weight });
    });

    dagre.layout(dagreGraph);

    // 3. Map new layouted positions
    const layoutedNodes: CustomNode[] = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const dims = getNodeDimensions(node, mode);

      return {
        ...node,
        position: {
          x: nodeWithPosition.x - dims.width / 2,
          y: nodeWithPosition.y - dims.height / 2,
        },
      };
    });

    // 4. Optimize edge handles so lines never cross or loop awkwardly
    const nodePositions: Record<string, { x: number; y: number }> = {};
    layoutedNodes.forEach((n) => {
      nodePositions[n.id] = n.position;
    });

    const layoutedEdges: CustomEdge[] = edges.map((edge) => {
      const sourcePos = nodePositions[edge.source];
      const targetPos = nodePositions[edge.target];
      if (!sourcePos || !targetPos) return edge;

      let sourceHandle = edge.sourceHandle;
      let targetHandle = edge.targetHandle;

      if (isHorizontal) {
        targetHandle = 'left';

        const outEdges = edges.filter((e) => e.source === edge.source);
        if (outEdges.length > 1) {
          // Sort outgoing edges by target's vertical position
          const sorted = [...outEdges].sort(
            (a, b) => (nodePositions[a.target]?.y ?? 0) - (nodePositions[b.target]?.y ?? 0)
          );
          const idx = sorted.findIndex((e) => e.id === edge.id);
          sourceHandle = idx === 0 ? 'right' : 'bottom';
        } else {
          sourceHandle = 'right';
        }
      } else {
        targetHandle = 'top';

        const outEdges = edges.filter((e) => e.source === edge.source);
        if (outEdges.length > 1) {
          const sorted = [...outEdges].sort(
            (a, b) => (nodePositions[a.target]?.x ?? 0) - (nodePositions[b.target]?.x ?? 0)
          );
          const idx = sorted.findIndex((e) => e.id === edge.id);
          if (idx === 0) {
            sourceHandle = 'left';
          } else if (idx === sorted.length - 1) {
            sourceHandle = 'right';
          } else {
            sourceHandle = 'bottom';
          }
        } else {
          sourceHandle = 'bottom';
        }
      }

      return {
        ...edge,
        sourceHandle,
        targetHandle,
      };
    });

    set((state) => {
      saveToStorage({ ...state, nodes: layoutedNodes, edges: layoutedEdges });
      return { nodes: layoutedNodes, edges: layoutedEdges };
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flowcraft:auto-layout'));
    }
  },
}));

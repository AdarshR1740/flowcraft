import { Node, Edge } from '@xyflow/react';

export type WorkflowMode = 'structured' | 'freeform';
export type ThemeMode = 'dark' | 'light';

export type NodeType = 'event' | 'task' | 'decision' | 'system' | 'sticky' | 'note';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ToolLink {
  id: string;
  name: string;
  url?: string;
}

export type StepStatus = 'draft' | 'in-review' | 'approved';

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  subtitle?: string;
  role?: string;
  duration?: string;
  description?: string;
  checklist?: ChecklistItem[];
  tools?: ToolLink[];
  status?: StepStatus;
  color?: string; // Pastel colors for stickies
  eventType?: 'start' | 'end';
  decisionOutputs?: string[]; // e.g., ['Yes', 'No']
  systemType?: string; // e.g., 'API', 'Database', 'CRM', 'Email'
}

export type CustomNode = Node<WorkflowNodeData>;
export type CustomEdge = Edge;

export interface WorkflowMeta {
  id: string;
  title: string;
  description?: string;
  author?: string;
  lastModified: string;
  mode: WorkflowMode;
}

export interface WorkflowExportData {
  meta: WorkflowMeta;
  nodes: CustomNode[];
  edges: CustomEdge[];
}

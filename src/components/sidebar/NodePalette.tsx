import React, { useState } from 'react';
import {
  Play,
  Flag,
  CheckSquare,
  HelpCircle,
  Database,
  StickyNote,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { NodeType, WorkflowNodeData, CustomNode } from '../../types/workflow';

interface PaletteItem {
  type: NodeType;
  label: string;
  category: 'structured' | 'freeform' | 'both';
  icon: React.ReactNode;
  defaultData: WorkflowNodeData;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'sticky',
    label: 'Sticky Note',
    category: 'both',
    icon: <StickyNote className="w-4 h-4 text-amber-500" />,
    defaultData: {
      label: 'Idea Note',
      description: 'Write quick notes or ideas...',
      color: '#fef08a',
    },
  },
  {
    type: 'task',
    label: 'Task Card',
    category: 'both',
    icon: <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    defaultData: {
      label: 'New Task',
      role: 'Owner',
    },
  },
  {
    type: 'note',
    label: 'Note / Text',
    category: 'both',
    icon: <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
    defaultData: {
      label: 'Note',
      description: '',
    },
  },
  {
    type: 'event',
    label: 'Start Node',
    category: 'both',
    icon: <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" />,
    defaultData: {
      label: 'Start',
      eventType: 'start',
    },
  },
  {
    type: 'decision',
    label: 'Decision',
    category: 'both',
    icon: <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    defaultData: {
      label: 'Decision?',
      decisionOutputs: ['Yes', 'No'],
    },
  },
  {
    type: 'system',
    label: 'System / Service',
    category: 'structured',
    icon: <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
    defaultData: {
      label: 'External System',
      systemType: 'API',
    },
  },
  {
    type: 'event',
    label: 'End Node',
    category: 'both',
    icon: <Flag className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 fill-rose-500/20" />,
    defaultData: {
      label: 'End',
      eventType: 'end',
    },
  },
];

export const NodePalette: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const mode = useWorkflowStore((state) => state.mode);
  const addNode = useWorkflowStore((state) => state.addNode);

  const onDragStart = (event: React.DragEvent, item: PaletteItem) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleQuickAdd = (item: PaletteItem) => {
    const x = 300 + Math.floor(Math.random() * 80) - 40;
    const y = 200 + Math.floor(Math.random() * 80) - 40;

    const newNode: CustomNode = {
      id: `${item.type}-${Date.now()}`,
      type: item.type,
      position: { x, y },
      data: { ...item.defaultData },
    };

    addNode(newNode);
  };

  const filteredItems = PALETTE_ITEMS.filter(
    (item) => item.category === 'both' || item.category === mode
  );

  return (
    <aside
      className={`relative z-20 flex flex-col bg-white/95 dark:bg-[#0c0e14]/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Header */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-300">
              Elements
            </h3>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-500">
              {mode}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mx-auto"
          title={collapsed ? 'Expand Palette' : 'Collapse Palette'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Palette List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={(e) => onDragStart(e, item)}
            className={`group relative flex items-center rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 p-2 transition-all cursor-grab active:cursor-grabbing select-none shadow-xs ${
              collapsed ? 'justify-center' : 'gap-2.5'
            }`}
          >
            <div className="shrink-0 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 group-hover:scale-105 transition-transform shadow-xs">
              {item.icon}
            </div>

            {!collapsed && (
              <span className="flex-1 text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                {item.label}
              </span>
            )}

            {!collapsed && (
              <button
                onClick={() => handleQuickAdd(item)}
                title="Add to canvas"
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}

            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-slate-100 text-xs rounded-md shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                {item.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

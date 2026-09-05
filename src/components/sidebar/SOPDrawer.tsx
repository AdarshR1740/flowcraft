import React, { useState } from 'react';
import {
  X,
  Trash2,
  Clock,
  User,
  CheckSquare,
  Plus,
  Link,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { StepStatus } from '../../types/workflow';

const POPULAR_ROLES = [
  'Sales Ops',
  'Compliance',
  'DevOps',
  'Legal Counsel',
  'Product Manager',
  'Frontend Dev',
  'Support Lead',
  'Finance',
];

const STICKY_COLORS = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Blue', value: '#bae6fd' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Rose', value: '#fecdd3' },
  { name: 'Purple', value: '#e9d5ff' },
];

export const SOPDrawer: React.FC = () => {
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useWorkflowStore((state) => state.setSelectedNodeId);
  const nodes = useWorkflowStore((state) => state.nodes);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const mode = useWorkflowStore((state) => state.mode);
  const isStructured = mode === 'structured';

  const [newChecklistText, setNewChecklistText] = useState('');
  const [newToolName, setNewToolName] = useState('');
  const [newToolUrl, setNewToolUrl] = useState('');
  const [showToolInput, setShowToolInput] = useState(false);

  if (!selectedNode) return null;

  const data = selectedNode.data;
  const isSticky = selectedNode.type === 'sticky';

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const currentChecklist = data.checklist || [];
    updateNodeData(selectedNode.id, {
      checklist: [
        ...currentChecklist,
        { id: `c-${Date.now()}`, text: newChecklistText.trim(), done: false },
      ],
    });
    setNewChecklistText('');
  };

  const handleToggleChecklist = (itemId: string) => {
    const currentChecklist = data.checklist || [];
    updateNodeData(selectedNode.id, {
      checklist: currentChecklist.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      ),
    });
  };

  const handleDeleteChecklist = (itemId: string) => {
    const currentChecklist = data.checklist || [];
    updateNodeData(selectedNode.id, {
      checklist: currentChecklist.filter((item) => item.id !== itemId),
    });
  };

  const handleAddTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolName.trim()) return;

    const currentTools = data.tools || [];
    updateNodeData(selectedNode.id, {
      tools: [
        ...currentTools,
        { id: `t-${Date.now()}`, name: newToolName.trim(), url: newToolUrl.trim() || undefined },
      ],
    });
    setNewToolName('');
    setNewToolUrl('');
    setShowToolInput(false);
  };

  const handleDeleteTool = (toolId: string) => {
    const currentTools = data.tools || [];
    updateNodeData(selectedNode.id, {
      tools: currentTools.filter((t) => t.id !== toolId),
    });
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-30 w-96 bg-white/98 dark:bg-[#0c0e14]/98 backdrop-blur-2xl border-l border-slate-200 dark:border-slate-800/80 shadow-2xl flex flex-col transform transition-transform duration-200 select-none">
      {/* Header */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
            {selectedNode.type}
          </span>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {isStructured ? 'SOP Specification' : 'Card Details'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => deleteNode(selectedNode.id)}
            title="Delete Node"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedNodeId(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Form */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 select-text">
        {/* Title & Subtitle */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isStructured ? 'Step Name' : 'Card Title'}
          </label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
            placeholder={isStructured ? "e.g., KYC Verification" : "Title or concept..."}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {isStructured && (
            <input
              type="text"
              value={data.subtitle || ''}
              onChange={(e) => updateNodeData(selectedNode.id, { subtitle: e.target.value })}
              placeholder="Short subtitle or summary line..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          )}
        </div>

        {/* Sticky Color Picker */}
        {isSticky && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Note Color
            </label>
            <div className="flex items-center gap-2">
              {STICKY_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => updateNodeData(selectedNode.id, { color: c.value })}
                  style={{ backgroundColor: c.value }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    data.color === c.value
                      ? 'ring-2 ring-slate-900 dark:ring-white scale-110'
                      : 'hover:scale-105'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Structured Mode Only: Status & Duration (Grid) */}
        {isStructured && !isSticky && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                Status
              </label>
              <select
                value={data.status || 'draft'}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { status: e.target.value as StepStatus })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="in-review">In Review</option>
                <option value="approved">Approved</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                Est. Duration
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={data.duration || ''}
                  onChange={(e) => updateNodeData(selectedNode.id, { duration: e.target.value })}
                  placeholder="e.g., 30 mins"
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Responsible Role */}
        {!isSticky && (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>{isStructured ? 'Responsible Role / Owner' : 'Owner / Tag (Optional)'}</span>
              <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            </label>
            <input
              type="text"
              value={data.role || ''}
              onChange={(e) => updateNodeData(selectedNode.id, { role: e.target.value })}
              placeholder="e.g., Compliance Officer"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
            {/* Quick role tags (Structured only) */}
            {isStructured && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {POPULAR_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => updateNodeData(selectedNode.id, { role })}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                      data.role === role
                        ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40 font-medium'
                        : 'bg-slate-100 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Checklist / Action Items (Structured Mode Only) */}
        {isStructured && !isSticky && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                <span>Checkpoints / Criteria</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {(data.checklist || []).filter((i) => i.done).length}/{(data.checklist || []).length}
              </span>
            </div>

            {/* Checklist Items */}
            <div className="space-y-1.5">
              {(data.checklist || []).map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0 bg-white dark:bg-slate-900"
                    />
                    <span className={item.done ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                      {item.text}
                    </span>
                  </label>
                  <button
                    onClick={() => handleDeleteChecklist(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add checklist input */}
            <form onSubmit={handleAddChecklist} className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Add checklist item..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newChecklistText.trim()}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Detailed Description / SOP Instructions / Freeform Notes */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{isStructured ? 'SOP Operating Instructions' : 'Notes & Instructions'}</span>
            <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </label>
          <textarea
            rows={isStructured ? 4 : 5}
            value={data.description || ''}
            onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
            placeholder={isStructured ? "Write clear, step-by-step instructions for whoever performs this step..." : "Add details, thoughts, or step instructions..."}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Linked Tools & External Resources (Structured Mode Only) */}
        {isStructured && !isSticky && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>Linked Tools & Systems</span>
              </label>
              <button
                type="button"
                onClick={() => setShowToolInput(!showToolInput)}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Add Link
              </button>
            </div>

            {/* List of tools */}
            <div className="space-y-1.5">
              {(data.tools || []).map((tool) => (
                <div
                  key={tool.id}
                  className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    {tool.url ? (
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {tool.name}
                      </a>
                    ) : (
                      <span className="truncate">{tool.name}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteTool(tool.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* New Tool Form */}
            {showToolInput && (
              <form
                onSubmit={handleAddTool}
                className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
              >
                <input
                  type="text"
                  value={newToolName}
                  onChange={(e) => setNewToolName(e.target.value)}
                  placeholder="Tool name (e.g., Salesforce, Jira, Docs)"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="url"
                  value={newToolUrl}
                  onChange={(e) => setNewToolUrl(e.target.value)}
                  placeholder="URL (optional, https://...)"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowToolInput(false)}
                    className="px-2.5 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newToolName.trim()}
                    className="px-3 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-500 disabled:opacity-50"
                  >
                    Save Tool
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

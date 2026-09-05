import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Play,
  Flag,
  CheckSquare,
  HelpCircle,
  Database,
  Clock,
  User,
} from 'lucide-react';
import { WorkflowNodeData } from '../../types/workflow';
import { useWorkflowStore } from '../../store/useWorkflowStore';

// Helper for status badge styling with Light & Dark support
const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'approved':
      return (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          Approved
        </span>
      );
    case 'in-review':
      return (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
          In Review
        </span>
      );
    case 'draft':
    default:
      return (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700">
          Draft
        </span>
      );
  }
};

// 1. EVENT NODE (Start / End)
export const EventNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;
  const isStart = nodeData.eventType !== 'end';

  return (
    <div
      className={`relative group px-3.5 py-1.5 rounded-full border transition-all duration-200 shadow-sm min-w-[130px] ${
        selected
          ? 'ring-2 ring-blue-500 border-transparent shadow-md'
          : 'hover:shadow'
      } ${
        isStart
          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950 dark:bg-emerald-950/50 dark:border-emerald-500/30 dark:text-emerald-100'
          : 'bg-rose-50/90 border-rose-200 text-rose-950 dark:bg-rose-950/50 dark:border-rose-500/30 dark:text-rose-100'
      }`}
    >
      {/* 4-sided connectivity */}
      <Handle type="source" position={Position.Left} id="left" className={`${isStart ? '!bg-emerald-500' : '!bg-rose-500'} hover:!scale-150 transition-transform`} />
      <Handle type="source" position={Position.Top} id="top" className={`${isStart ? '!bg-emerald-500' : '!bg-rose-500'} hover:!scale-150 transition-transform`} />
      <Handle type="source" position={Position.Right} id="right" className={`${isStart ? '!bg-emerald-500' : '!bg-rose-500'} hover:!scale-150 transition-transform`} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={`${isStart ? '!bg-emerald-500' : '!bg-rose-500'} hover:!scale-150 transition-transform`} />

      <div className="flex items-center gap-2">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
            isStart
              ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
              : 'bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
          }`}
        >
          {isStart ? <Play className="w-2.5 h-2.5 fill-current ml-0.5" /> : <Flag className="w-2.5 h-2.5 fill-current" />}
        </div>
        <div className="overflow-hidden">
          <div className="text-xs font-semibold tracking-tight truncate">
            {nodeData.label || (isStart ? 'Start' : 'End')}
          </div>
          {nodeData.subtitle && (
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
              {nodeData.subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// 2. TASK / ACTION NODE - Clean & Compact in Freeform, Detailed in Structured
export const TaskNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;
  const mode = useWorkflowStore((state) => state.mode);
  const isStructured = mode === 'structured';

  const checklist = nodeData.checklist || [];
  const completedCount = checklist.filter((i) => i.done).length;
  const hasChecklist = isStructured && checklist.length > 0;

  // In Freeform Mode: Simple, sleek, zero clutter
  if (!isStructured) {
    return (
      <div
        className={`relative min-w-[140px] max-w-[190px] rounded-xl border p-2.5 transition-all duration-200 ${
          selected
            ? 'border-blue-500 ring-2 ring-blue-500/25 shadow-lg shadow-blue-500/10'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
        } bg-white dark:bg-[#12151e]`}
      >
        {/* 4-sided connectivity */}
        <Handle type="source" position={Position.Left} id="left" className="!bg-blue-500 hover:!scale-150 transition-transform" />
        <Handle type="source" position={Position.Top} id="top" className="!bg-blue-500 hover:!scale-150 transition-transform" />
        <Handle type="source" position={Position.Right} id="right" className="!bg-blue-500 hover:!scale-150 transition-transform" />
        <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-blue-500 hover:!scale-150 transition-transform" />

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CheckSquare className="w-3.5 h-3.5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {nodeData.label || 'Task / Step'}
            </h4>
            {nodeData.role && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block">
                {nodeData.role}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // In Structured Mode: Detailed SOP Card with role, subtitle, status, duration & checkpoints
  return (
    <div
      className={`relative w-[230px] rounded-xl border p-3 transition-all duration-200 ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-500/25 shadow-lg shadow-blue-500/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-xl'
      } bg-white dark:bg-[#12151e]`}
    >
      {/* 4-sided connectivity for connecting from/to any side */}
      <Handle type="source" position={Position.Left} id="left" className="!bg-blue-500 hover:!scale-150 transition-transform" />
      <Handle type="source" position={Position.Top} id="top" className="!bg-blue-500 hover:!scale-150 transition-transform" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-blue-500 hover:!scale-150 transition-transform" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-blue-500 hover:!scale-150 transition-transform" />

      {/* Role tag if present */}
      {nodeData.role && (
        <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium truncate max-w-[130px] bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20 mb-1.5 w-fit">
          <User className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">{nodeData.role}</span>
        </div>
      )}

      {/* Title & Subtitle */}
      <div>
        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
          {nodeData.label || 'Action / Step'}
        </h4>
        {nodeData.subtitle && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
            {nodeData.subtitle}
          </p>
        )}
      </div>

      {/* Structured Mode Only: Status, Checkpoints & Duration */}
      {(nodeData.status || nodeData.duration) && (
        <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1">
          {nodeData.status && getStatusBadge(nodeData.status)}
          {nodeData.duration && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono ml-auto">
              <Clock className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
              {nodeData.duration}
            </span>
          )}
        </div>
      )}

      {hasChecklist && (
        <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-2.5 h-2.5 text-blue-500" /> Checkpoints
            </span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
              {completedCount}/{checklist.length}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / checklist.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

// 3. DECISION NODE (Gateway)
export const DecisionNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;

  return (
    <div
      className={`relative w-[180px] rounded-xl border p-2.5 transition-all duration-200 ${
        selected
          ? 'border-amber-400 ring-2 ring-amber-400/25 shadow-lg shadow-amber-400/10'
          : 'border-amber-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-slate-700 shadow-sm dark:shadow-xl'
      } bg-amber-50/30 dark:bg-[#12151e]`}
    >
      <Handle type="source" position={Position.Left} id="left" className="!bg-amber-500" />
      <Handle type="source" position={Position.Top} id="top" className="!bg-amber-500" />

      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-4 h-4 rounded-md bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center shrink-0">
          <HelpCircle className="w-2.5 h-2.5" />
        </div>
        <span className="text-[10px] uppercase font-mono tracking-wider text-amber-700 dark:text-amber-400 font-semibold">
          Decision
        </span>
      </div>

      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
        {nodeData.label || 'Decision Gateway?'}
      </h4>
      {nodeData.subtitle && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
          {nodeData.subtitle}
        </p>
      )}

      {/* Outgoing branches indicator */}
      <div className="mt-2 pt-1.5 border-t border-amber-200/40 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
        <span className="text-emerald-700 dark:text-emerald-400 flex items-center font-medium">
          → Yes
        </span>
        <span className="text-rose-700 dark:text-rose-400 flex items-center font-medium">
          ↓ No
        </span>
      </div>

      <Handle type="source" position={Position.Right} id="right" className="!bg-emerald-500 !top-[40%] hover:!scale-150 transition-transform" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-rose-500 hover:!scale-150 transition-transform" />
      {/* Compatibility aliases for yes/no handles */}
      <Handle type="source" position={Position.Right} id="yes" className="!bg-emerald-500 !top-[40%] opacity-0 pointer-events-none" />
      <Handle type="source" position={Position.Bottom} id="no" className="!bg-rose-500 opacity-0 pointer-events-none" />
    </div>
  );
});

// 4. SYSTEM / INTEGRATION NODE
export const SystemNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;

  return (
    <div
      className={`relative w-[190px] rounded-xl border p-2.5 transition-all duration-200 ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/25 shadow-lg shadow-indigo-500/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-xl'
      } bg-white dark:bg-[#12151e]`}
    >
      <Handle type="source" position={Position.Left} id="left" className="!bg-indigo-500" />
      <Handle type="source" position={Position.Top} id="top" className="!bg-indigo-500" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-indigo-500" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-indigo-500" />

      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Database className="w-3 h-3" />
        </div>
        <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
          {nodeData.systemType || 'System'}
        </span>
      </div>

      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
        {nodeData.label || 'External Service'}
      </h4>
      {nodeData.subtitle && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          {nodeData.subtitle}
        </p>
      )}
    </div>
  );
});

// 5. STICKY NOTE (Freeform Mode) - Clean, Tactile, No Clutter
export const StickyNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;
  const bgColor = nodeData.color || '#fef08a';

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className={`relative w-[180px] min-h-[110px] rounded-xl p-3 text-slate-900 shadow-sm transition-all duration-200 ${
        selected ? 'ring-2 ring-blue-600 shadow-md scale-[1.02]' : 'hover:shadow hover:scale-[1.01]'
      }`}
    >
      {/* 360-Degree Connectors on all 4 sides */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className="!bg-slate-700/60 !w-2.5 !h-2.5 hover:!scale-150 transition-transform"
        title="Connect from top"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-slate-700/60 !w-2.5 !h-2.5 hover:!scale-150 transition-transform"
        title="Connect from right"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!bg-slate-700/60 !w-2.5 !h-2.5 hover:!scale-150 transition-transform"
        title="Connect from bottom"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!bg-slate-700/60 !w-2.5 !h-2.5 hover:!scale-150 transition-transform"
        title="Connect from left"
      />

      {nodeData.label && (
        <h5 className="font-bold text-xs leading-snug mb-1 text-slate-900 truncate">
          {nodeData.label}
        </h5>
      )}
      {nodeData.description && (
        <p className="text-[11px] leading-relaxed text-slate-800/90 whitespace-pre-wrap line-clamp-3">
          {nodeData.description}
        </p>
      )}
    </div>
  );
});

// 6. TEXT NOTE / SECTION HEADER - Minimal & Clean
export const NoteNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;

  return (
    <div
      className={`relative p-2.5 rounded-xl border border-dashed transition-all duration-200 min-w-[150px] max-w-[210px] ${
        selected
          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-500/10 ring-2 ring-blue-500/20'
          : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white/70 dark:bg-slate-900/40 shadow-xs'
      }`}
    >
      {/* 360-Degree Connectors on all 4 sides */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className="!bg-slate-400 dark:!bg-slate-500 !w-2.5 !h-2.5 hover:!scale-150 transition-transform"
        title="Connect from top"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-slate-400 dark:!bg-slate-500 !w-2.5 !h-2.5 hover:!scale-150 transition-transform"
        title="Connect from right"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!bg-slate-400 dark:!bg-slate-500 !w-2.5 !h-2.5 hover:!scale-150 transition-transform"
        title="Connect from bottom"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!bg-slate-400 dark:!bg-slate-500 !w-2.5 !h-2.5 hover:!scale-150 transition-transform"
        title="Connect from left"
      />

      <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
        {nodeData.label || 'Note'}
      </h3>
      {nodeData.description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap line-clamp-2">
          {nodeData.description}
        </p>
      )}
    </div>
  );
});

export const nodeTypes = {
  event: EventNode,
  task: TaskNode,
  decision: DecisionNode,
  system: SystemNode,
  sticky: StickyNode,
  note: NoteNode,
};

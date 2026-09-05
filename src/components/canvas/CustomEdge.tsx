import React, { useState, useRef } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
} from '@xyflow/react';
import { X } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export const DeletableEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
  type,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deleteEdge = useWorkflowStore((state) => state.deleteEdge);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 450);
  };

  const isSmooth = type === 'smoothstep';

  const [edgePath, labelX, labelY] = isSmooth
    ? getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 8,
      })
    : getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });

  const showDelete = selected || isHovered;

  return (
    <g
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group cursor-pointer"
    >
      {/* Invisible wider stroke to make hovering and clicking effortless */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={30}
        className="react-flow__edge-interaction cursor-pointer"
      />

      {/* Actual visible edge */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#3b82f6' : style.stroke,
          strokeWidth: selected ? 2.5 : isHovered ? 2.2 : 1.8,
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex items-center gap-1.5 z-30"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Label if present */}
          {label && (
            <span className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
              {label as string}
            </span>
          )}

          {/* Visible Delete Button on Hover or Selection */}
          {showDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteEdge(id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              title="Delete connector line"
              className="w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md hover:scale-115 transition-transform cursor-pointer border border-white dark:border-slate-900"
            >
              <X className="w-3 h-3 stroke-[2.5]" />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </g>
  );
};

export const edgeTypes = {
  default: DeletableEdge,
  smoothstep: DeletableEdge,
  bezier: DeletableEdge,
  straight: DeletableEdge,
  step: DeletableEdge,
};

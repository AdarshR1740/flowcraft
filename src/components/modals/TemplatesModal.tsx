import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { WORKFLOW_TEMPLATES } from '../../data/templates';
import { useWorkflowStore } from '../../store/useWorkflowStore';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose }) => {
  const loadTemplate = useWorkflowStore((state) => state.loadTemplate);

  if (!isOpen) return null;

  const handleSelectTemplate = (templateId: string) => {
    loadTemplate(templateId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white dark:bg-[#10131c] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Workflow Templates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a pre-configured workflow map to explore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template List */}
        <div className="p-6 space-y-3">
          {WORKFLOW_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl.id)}
              className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all flex items-start justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tmpl.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                    {tmpl.mode}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {tmpl.description}
                </p>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-1 font-mono">
                  {tmpl.nodes.length} nodes · {tmpl.edges.length} connections
                </div>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-transparent text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 shadow-xs">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

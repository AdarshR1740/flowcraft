import React, { useState } from 'react';
import {
  GitFork,
  Sparkles,
  Download,
  Upload,
  Trash2,
  Columns,
  Rows,
  Edit2,
  Check,
  Shapes,
  Sun,
  Moon,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

interface HeaderBarProps {
  onOpenExport: () => void;
  onOpenTemplates: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onOpenExport, onOpenTemplates }) => {
  const title = useWorkflowStore((state) => state.title);
  const setTitle = useWorkflowStore((state) => state.setTitle);
  const mode = useWorkflowStore((state) => state.mode);
  const setMode = useWorkflowStore((state) => state.setMode);
  const theme = useWorkflowStore((state) => state.theme);
  const toggleTheme = useWorkflowStore((state) => state.toggleTheme);
  const autoLayout = useWorkflowStore((state) => state.autoLayout);
  const resetWorkflow = useWorkflowStore((state) => state.resetWorkflow);
  const importWorkflow = useWorkflowStore((state) => state.importWorkflow);
  const nodes = useWorkflowStore((state) => state.nodes);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      setTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && (json.nodes || (json.data && json.data.nodes))) {
          importWorkflow(json);
        } else {
          alert('Invalid workflow file: missing nodes.');
        }
      } catch (err) {
        console.error('Failed to parse JSON workflow file', err);
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const isDark = theme === 'dark';

  return (
    <header className="h-14 px-4 bg-white/95 dark:bg-[#0c0e14]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between z-20 select-none transition-colors duration-200">
      {/* Left: Brand & Workflow Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <GitFork className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white hidden sm:inline">
            Flowcraft
          </span>
        </div>

        {/* Title Editor */}
        <div className="flex items-center gap-1.5 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                autoFocus
                className="px-2.5 py-1 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-blue-500 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 rounded text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempTitle(title);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors truncate group"
              title="Click to rename workflow"
            >
              <span className="truncate max-w-[170px] sm:max-w-[240px]">{title}</span>
              <Edit2 className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Center: Mode Toggle Switch (Structured Flowchart vs Freeform Board) */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
        <button
          onClick={() => setMode('structured')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'structured'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Strict orthogonal flowchart mode with grid snapping and formal diagram logic"
        >
          <GitFork className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Structured</span> Flowchart
        </button>

        <button
          onClick={() => setMode('freeform')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'freeform'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Freeform ideation board with stickies, cards, and smooth curved connectors"
        >
          <Shapes className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Freeform</span> Board
        </button>
      </div>

      {/* Right: Actions (Theme toggle, Auto-Layout, Templates, Export, Clear) */}
      <div className="flex items-center gap-1.5">
        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Auto-Layout Buttons */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-0.5">
          <button
            onClick={() => autoLayout('LR')}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            title="Auto-arrange graph horizontally (Left to Right)"
          >
            <Columns className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span className="hidden lg:inline">Tidy</span> →
          </button>
          <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-800" />
          <button
            onClick={() => autoLayout('TB')}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            title="Auto-arrange graph vertically (Top to Bottom)"
          >
            <Rows className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span className="hidden lg:inline">Tidy</span> ↓
          </button>
        </div>

        {/* Templates Picker */}
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors"
          title="Load pre-built workflow templates"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span className="hidden sm:inline">Templates</span>
        </button>

        {/* Import File Button */}
        <label
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 cursor-pointer transition-colors"
          title="Import workflow from JSON file"
        >
          <Upload className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          <span className="hidden sm:inline">Import</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </label>

        {/* Export Modal trigger */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all"
          title="Export SOP document, image, or JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Clear Canvas */}
        <button
          onClick={() => {
            if (nodes.length === 0) return;
            if (window.confirm('Clear all nodes and connections from the canvas?')) {
              resetWorkflow();
            }
          }}
          disabled={nodes.length === 0}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-500/30 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Clear entire canvas"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </header>
  );
};

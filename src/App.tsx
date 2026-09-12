import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { HeaderBar } from './components/header/HeaderBar';
import { NodePalette } from './components/sidebar/NodePalette';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { SOPDrawer } from './components/sidebar/SOPDrawer';
import { ExportModal } from './components/modals/ExportModal';
import { TemplatesModal } from './components/modals/TemplatesModal';
import { useWorkflowStore } from './store/useWorkflowStore';

export const App: React.FC = () => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const theme = useWorkflowStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col bg-slate-50 dark:bg-[#090b10] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
        {/* Header bar with controls, mode toggle, theme switch & layout buttons */}
        <HeaderBar
          onOpenExport={() => setIsExportOpen(true)}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
        />

        {/* Main Workspace */}
        <main className="flex-1 flex relative overflow-hidden">
          {/* Left: Drag-and-drop Elements Palette */}
          <NodePalette />

          {/* Center: React Flow Canvas */}
          <div className="flex-1 relative h-full">
            <WorkflowCanvas />
          </div>

          {/* Right: Living SOP Inspector Drawer (opens when a node is selected) */}
          <SOPDrawer />
        </main>

        {/* Modals */}
        <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
        <TemplatesModal isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} />
      </div>
    </ReactFlowProvider>
  );
};

export default App;

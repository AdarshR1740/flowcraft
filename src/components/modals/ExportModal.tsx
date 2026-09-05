import React, { useState } from 'react';
import {
  X,
  FileDown,
  Copy,
  Check,
  Image as ImageIcon,
  Code,
  FileText,
  Upload,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { WorkflowExportData } from '../../types/workflow';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sop' | 'image' | 'json'>('sop');
  const [copied, setCopied] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const title = useWorkflowStore((state) => state.title);
  const description = useWorkflowStore((state) => state.description);
  const mode = useWorkflowStore((state) => state.mode);
  const theme = useWorkflowStore((state) => state.theme);
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const importWorkflow = useWorkflowStore((state) => state.importWorkflow);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const isStructured = mode === 'structured';

  // Generate Markdown based on current board mode (freeform vs structured)
  const generateMarkdown = () => {
    const dateStr = new Date().toLocaleDateString();

    if (!isStructured) {
      // FREEFORM BOARD EXPORT: Clean, human-friendly process & ideation notes
      let md = `# ${title}\n\n`;
      if (description) {
        md += `> ${description}\n\n`;
      }
      md += `*Exported on: ${dateStr} | Total Elements: ${nodes.length} | Mode: Freeform Board*\n\n`;
      md += `---\n\n`;

      if (nodes.length === 0) {
        md += `*No elements on board.*\n`;
        return md;
      }

      md += `## Board Elements\n\n`;

      nodes.forEach((node, index) => {
        const data = node.data;
        const nodeType = node.type || 'element';

        if (nodeType === 'sticky') {
          md += `### 📌 ${data.label || `Sticky Note ${index + 1}`}\n`;
          if (data.description) {
            md += `${data.description}\n\n`;
          } else {
            md += `\n`;
          }
        } else if (nodeType === 'note') {
          md += `### 📝 ${data.label || `Note ${index + 1}`}\n`;
          if (data.description) {
            md += `${data.description}\n\n`;
          } else {
            md += `\n`;
          }
        } else if (nodeType === 'event') {
          const isStart = data.eventType !== 'end';
          md += `### ${isStart ? '🟢 Start' : '🔴 End'}: ${data.label || (isStart ? 'Start' : 'End')}\n\n`;
          if (data.description) {
            md += `${data.description}\n\n`;
          }
        } else if (nodeType === 'task') {
          md += `### ⚡ ${data.label || `Step ${index + 1}`}\n`;
          if (data.role) md += `- **Owner / Tag**: ${data.role}\n`;
          if (data.description) {
            md += `\n${data.description}\n\n`;
          } else {
            md += `\n`;
          }
        } else if (nodeType === 'decision') {
          md += `### ❓ Decision: ${data.label || `Decision ${index + 1}`}\n`;
          if (data.description) md += `${data.description}\n\n`;
          else md += `\n`;
        } else {
          // General / System
          md += `### 🔷 ${data.label || `Item ${index + 1}`}\n`;
          if (data.description) md += `${data.description}\n\n`;
          else md += `\n`;
        }
      });

      // Connections summary in freeform
      if (edges.length > 0) {
        md += `---\n\n## Connections & Flow\n\n`;
        const nodeMap = new Map(nodes.map((n) => [n.id, n.data.label || n.id]));
        edges.forEach((edge) => {
          const from = nodeMap.get(edge.source) || edge.source;
          const to = nodeMap.get(edge.target) || edge.target;
          const labelPart = edge.label ? ` *(label: ${edge.label})*` : '';
          md += `- **${from}** ➔ **${to}**${labelPart}\n`;
        });
        md += `\n`;
      }

      return md;
    }

    // STRUCTURED FLOWCHART EXPORT: Formal SOP with checkpoints, roles, duration, status
    let md = `# Standard Operating Procedure: ${title}\n\n`;
    if (description) {
      md += `> **Overview**: ${description}\n\n`;
    }
    md += `*Generated on: ${dateStr} | Total Steps: ${nodes.length} | Mode: Structured SOP Flowchart*\n\n`;
    md += `---\n\n`;

    if (nodes.length === 0) {
      md += `*No steps configured.*\n`;
      return md;
    }

    nodes.forEach((node, index) => {
      const data = node.data;
      md += `### Step ${index + 1}: ${data.label || 'Untitled Step'}\n`;
      if (data.subtitle) md += `*${data.subtitle}*\n\n`;

      md += `- **Type**: \`${node.type}\`\n`;
      if (data.role) md += `- **Responsible Role**: **${data.role}**\n`;
      if (data.duration) md += `- **Est. Duration**: ${data.duration}\n`;
      if (data.status) md += `- **Review Status**: ${data.status.toUpperCase()}\n`;

      if (data.description) {
        md += `\n**Operating Instructions:**\n${data.description}\n`;
      }

      if (data.checklist && data.checklist.length > 0) {
        md += `\n**Checkpoints / Verification Criteria:**\n`;
        data.checklist.forEach((item) => {
          md += `- [${item.done ? 'x' : ' '}] ${item.text}\n`;
        });
      }

      if (data.tools && data.tools.length > 0) {
        md += `\n**Required Tools & Systems:**\n`;
        data.tools.forEach((tool) => {
          if (tool.url) {
            md += `- [${tool.name}](${tool.url})\n`;
          } else {
            md += `- ${tool.name}\n`;
          }
        });
      }

      md += `\n---\n\n`;
    });

    // Flowchart transitions & branch logic
    if (edges.length > 0) {
      md += `## Flowchart Transitions & Decision Logic\n\n`;
      const nodeMap = new Map(nodes.map((n) => [n.id, n.data.label || n.id]));
      edges.forEach((edge) => {
        const from = nodeMap.get(edge.source) || edge.source;
        const to = nodeMap.get(edge.target) || edge.target;
        const branchCondition = edge.label ? ` [Condition: ${edge.label}]` : '';
        md += `- **${from}** ➔ **${to}**${branchCondition}\n`;
      });
      md += `\n`;
    }

    return md;
  };

  const markdownContent = generateMarkdown();

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileSlug = title.toLowerCase().replace(/\s+/g, '-');
    link.download = isStructured ? `${fileSlug}-sop.md` : `${fileSlug}-board-notes.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = async () => {
    const canvasElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!canvasElement) return;

    try {
      setIsExportingImage(true);
      const dataUrl = await toPng(canvasElement, {
        backgroundColor: isDark ? '#090b10' : '#f8fafc',
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-flowchart.png`;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleExportJSON = () => {
    const exportData: WorkflowExportData = {
      meta: {
        id: `wf-${Date.now()}`,
        title,
        description,
        lastModified: new Date().toISOString(),
        mode,
      },
      nodes,
      edges,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.flowcraft.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.nodes && json.edges) {
          importWorkflow(json);
          onClose();
        }
      } catch (err) {
        console.error('Failed to parse JSON workflow file', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-[#10131c] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Export & Share Workflow
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isStructured
                ? 'Download SOP document, high-res image, or JSON backup'
                : 'Download board notes, high-res image, or JSON backup'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveTab('sop')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'sop'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {isStructured ? 'Markdown SOP Document' : 'Markdown Board Notes'}
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'image'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            PNG Image
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'json'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            JSON Backup & Import
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'sop' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {isStructured
                    ? 'Formatted for Notion, Confluence, GitHub, or Obsidian SOP'
                    : 'Formatted for Notion, Obsidian, or Markdown notes'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : isStructured ? 'Copy SOP' : 'Copy Notes'}
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    {isStructured ? 'Download SOP .md' : 'Download Notes .md'}
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-300 overflow-x-auto max-h-[340px] whitespace-pre-wrap leading-relaxed">
                {markdownContent}
              </pre>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ImageIcon className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  Export as High-Resolution PNG
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Downloads a crystal-clear image of your current workflow map matching your active theme.
                </p>
              </div>
              <button
                onClick={handleExportPNG}
                disabled={isExportingImage}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium shadow-sm transition-all inline-flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                {isExportingImage ? 'Generating Image...' : 'Download PNG'}
              </button>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                    Export Workflow JSON
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Save full workflow model with node metadata and connections.
                  </p>
                </div>
                <button
                  onClick={handleExportJSON}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Save File
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                    Import Existing Workflow
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Restore a previous .flowcraft.json file.
                  </p>
                </div>
                <label className="cursor-pointer px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Select File
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

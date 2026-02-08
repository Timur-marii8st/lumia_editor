import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Upload, FileJson, FileText, FileCode, Copy, Check, Undo2, Redo2 } from "lucide-react";
import { useBlockStore } from "../store/blockStore";
import { useHistory } from "../hooks/useHistory";
import { copyBlocksToClipboard, pasteBlocksFromClipboard } from "../utils/serialization";

export const EditorToolbar: React.FC = () => {
  const { blocks, toJSON, toMarkdown, toHTML, fromJSON, fromMarkdown } = useBlockStore();
  const { undo, redo, canUndo, canRedo } = useHistory();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExportJSON = () => {
    const json = toJSON();
    downloadFile(json, "blocks.json", "application/json");
    setShowExportMenu(false);
  };

  const handleExportMarkdown = () => {
    const markdown = toMarkdown();
    downloadFile(markdown, "blocks.md", "text/markdown");
    setShowExportMenu(false);
  };

  const handleExportHTML = () => {
    const html = toHTML();
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Blocks</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
    blockquote { border-left: 4px solid #ddd; padding-left: 1em; margin: 1em 0; color: #666; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    pre { background: #f5f5f5; padding: 1em; border-radius: 6px; overflow-x: auto; }
    .callout { padding: 1em; border-radius: 6px; margin: 1em 0; }
    .callout-info { background: #e3f2fd; border-left: 4px solid #2196f3; }
    .callout-warning { background: #fff3e0; border-left: 4px solid #ff9800; }
    .callout-error { background: #ffebee; border-left: 4px solid #f44336; }
    .callout-tip { background: #e8f5e9; border-left: 4px solid #4caf50; }
    .callout-note { background: #f3e5f5; border-left: 4px solid #9c27b0; }
    .todo { display: flex; align-items: center; gap: 0.5em; margin: 0.5em 0; }
    hr { border: none; border-top: 2px solid #ddd; margin: 2em 0; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
    downloadFile(fullHTML, "blocks.html", "text/html");
    setShowExportMenu(false);
  };

  const handleCopyMarkdown = async () => {
    await copyBlocksToClipboard(blocks);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        fromJSON(text);
        setShowImportMenu(false);
      }
    };
    input.click();
  };

  const handleImportMarkdown = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.markdown";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        fromMarkdown(text);
        setShowImportMenu(false);
      }
    };
    input.click();
  };

  const handlePasteFromClipboard = async () => {
    try {
      const blocks = await pasteBlocksFromClipboard();
      useBlockStore.setState({ blocks });
      setShowImportMenu(false);
    } catch (error) {
      console.error("Failed to paste from clipboard:", error);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed top-4 right-4 z-40 flex gap-2">
      {/* Undo/Redo */}
      <div className="flex gap-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm p-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Undo (Cmd+Z)"
        >
          <Undo2 className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
        </button>
      </div>

      {/* Export Menu */}
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
        >
          <Download className="w-4 h-4" />
          Export
        </button>

        <AnimatePresence>
          {showExportMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-1"
            >
              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-sm"
              >
                <FileJson className="w-4 h-4" />
                Export as JSON
              </button>
              <button
                onClick={handleExportMarkdown}
                className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4" />
                Export as Markdown
              </button>
              <button
                onClick={handleExportHTML}
                className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-sm"
              >
                <FileCode className="w-4 h-4" />
                Export as HTML
              </button>
              <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />
              <button
                onClick={handleCopyMarkdown}
                className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy as Markdown
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Import Menu */}
      <div className="relative">
        <button
          onClick={() => setShowImportMenu(!showImportMenu)}
          className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
        >
          <Upload className="w-4 h-4" />
          Import
        </button>

        <AnimatePresence>
          {showImportMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-1"
            >
              <button
                onClick={handleImportJSON}
                className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-sm"
              >
                <FileJson className="w-4 h-4" />
                Import JSON
              </button>
              <button
                onClick={handleImportMarkdown}
                className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4" />
                Import Markdown
              </button>
              <button
                onClick={handlePasteFromClipboard}
                className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-sm"
              >
                <Copy className="w-4 h-4" />
                Paste from Clipboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

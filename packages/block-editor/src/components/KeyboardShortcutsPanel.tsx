import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";

interface Shortcut {
  keys: string;
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Editing
  { keys: "Cmd+Z", description: "Undo", category: "Editing" },
  { keys: "Cmd+Shift+Z", description: "Redo", category: "Editing" },
  { keys: "Cmd+A", description: "Select all blocks", category: "Editing" },
  { keys: "Cmd+D", description: "Duplicate selected", category: "Editing" },
  { keys: "Delete", description: "Delete selected", category: "Editing" },
  { keys: "Escape", description: "Clear selection", category: "Editing" },

  // Navigation
  { keys: "Cmd+F", description: "Search", category: "Navigation" },
  { keys: "Enter", description: "Next search result", category: "Navigation" },
  { keys: "Shift+Enter", description: "Previous result", category: "Navigation" },
  { keys: "Space", description: "Grab block (on handle)", category: "Navigation" },
  { keys: "↑↓", description: "Move grabbed block", category: "Navigation" },

  // Block Operations
  { keys: "Cmd+Shift+↑", description: "Move selected up", category: "Block Operations" },
  { keys: "Cmd+Shift+↓", description: "Move selected down", category: "Block Operations" },
  { keys: "/", description: "Open slash menu", category: "Block Operations" },
  { keys: "↑↓", description: "Navigate slash menu", category: "Block Operations" },
  { keys: "Enter", description: "Select command", category: "Block Operations" },

  // AI
  { keys: "Select text", description: "Show AI context menu", category: "AI" },
  { keys: "/ai", description: "Generate with AI", category: "AI" },
];

export const KeyboardShortcutsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to toggle shortcuts panel
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Escape to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 p-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-full shadow-lg hover:shadow-xl transition-all"
        title="Keyboard Shortcuts (Cmd+K)"
      >
        <Keyboard className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh] bg-white dark:bg-neutral-800 rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3">
                  <Keyboard className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    Keyboard Shortcuts
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
                {categories.map((category) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {shortcuts
                        .filter((s) => s.category === category)
                        .map((shortcut, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                          >
                            <span className="text-neutral-700 dark:text-neutral-300">
                              {shortcut.description}
                            </span>
                            <kbd className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded text-sm font-mono text-neutral-900 dark:text-neutral-100">
                              {shortcut.keys}
                            </kbd>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                  Press <kbd className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded text-xs font-mono">Cmd+K</kbd> to toggle this panel
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

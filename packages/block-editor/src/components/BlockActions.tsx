import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useBlockStore } from "../store/blockStore";
import { nanoid } from "nanoid";

interface BlockActionsProps {
  blockId: string;
  index: number;
}

export const BlockActions: React.FC<BlockActionsProps> = ({ index }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { addBlock } = useBlockStore();

  const handleAddBlock = (type: string) => {
    addBlock(
      {
        id: nanoid(),
        type: type as any,
        content: "",
        properties: {},
      },
      index + 1
    );
    setMenuOpen(false);
  };

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
          title="Add block below"
        >
          <Plus className="w-4 h-4 text-neutral-400" />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50"
            >
              <button
                onClick={() => handleAddBlock("paragraph")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Paragraph
              </button>
              <button
                onClick={() => handleAddBlock("heading1")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Heading 1
              </button>
              <button
                onClick={() => handleAddBlock("heading2")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Heading 2
              </button>
              <button
                onClick={() => handleAddBlock("heading3")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Heading 3
              </button>
              <button
                onClick={() => handleAddBlock("bulletList")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Bullet List
              </button>
              <button
                onClick={() => handleAddBlock("numberedList")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Numbered List
              </button>
              <button
                onClick={() => handleAddBlock("quote")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Quote
              </button>
              <button
                onClick={() => handleAddBlock("todo")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                To-do
              </button>
              <button
                onClick={() => handleAddBlock("code")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Code
              </button>
              <button
                onClick={() => handleAddBlock("callout")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Callout
              </button>
              <button
                onClick={() => handleAddBlock("toggle")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Toggle
              </button>
              <button
                onClick={() => handleAddBlock("divider")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Divider
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

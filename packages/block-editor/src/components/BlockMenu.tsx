import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, Trash2, Copy, ArrowUp, ArrowDown, MoreHorizontal, Sparkles, RefreshCw } from "lucide-react";
import { useBlockStore } from "../store/blockStore";
import { useAI } from "../hooks/useAI";

interface BlockMenuProps {
  blockId: string;
  dragHandleProps?: any;
  onMenuInteraction?: () => void;
}

export const BlockMenu: React.FC<BlockMenuProps> = ({ blockId, dragHandleProps, onMenuInteraction }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { deleteBlock, duplicateBlock, moveBlock, blocks } = useBlockStore();
  const { improveBlock, continueWriting, isGenerating } = useAI();

  const blockIndex = blocks.findIndex(b => b.id === blockId);

  const handleDelete = () => {
    deleteBlock(blockId);
    setMenuOpen(false);
  };

  const handleDuplicate = () => {
    duplicateBlock(blockId);
    setMenuOpen(false);
  };

  const handleMoveUp = () => {
    if (blockIndex > 0) {
      moveBlock(blockId, blockIndex - 1);
    }
    setMenuOpen(false);
  };

  const handleMoveDown = () => {
    if (blockIndex < blocks.length - 1) {
      moveBlock(blockId, blockIndex + 1);
    }
    setMenuOpen(false);
  };

  const handleImprove = async () => {
    setMenuOpen(false);
    try {
      await improveBlock(blockId);
    } catch (error) {
      console.error("Failed to improve block:", error);
    }
  };

  const handleContinue = async () => {
    setMenuOpen(false);
    try {
      await continueWriting(blockId);
    } catch (error) {
      console.error("Failed to continue writing:", error);
    }
  };

  return (
    <div 
      className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
      onMouseEnter={onMenuInteraction}
    >
      {/* Drag Handle */}
      <button
        {...dragHandleProps}
        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded cursor-grab active:cursor-grabbing"
        title="Drag to move"
      >
        <GripVertical className="w-4 h-4 text-neutral-400" />
      </button>

      {/* More Actions Menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
          title="More actions"
        >
          <MoreHorizontal className="w-4 h-4 text-neutral-400" />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              onMouseEnter={onMenuInteraction}
              className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50"
            >
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={handleDuplicate}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />
              <button
                onClick={handleMoveUp}
                disabled={blockIndex === 0}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUp className="w-4 h-4" />
                Move up
              </button>
              <button
                onClick={handleMoveDown}
                disabled={blockIndex === blocks.length - 1}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDown className="w-4 h-4" />
                Move down
              </button>
              <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />
              <button
                onClick={handleImprove}
                disabled={isGenerating}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-purple-600 dark:text-purple-400 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? "Improving..." : "Improve with AI"}
              </button>
              <button
                onClick={handleContinue}
                disabled={isGenerating}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-purple-600 dark:text-purple-400 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                {isGenerating ? "Generating..." : "Continue writing"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

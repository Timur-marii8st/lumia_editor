import React, { useRef, useEffect, useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBlockStore } from "../../store/blockStore";
import type { Block } from "../../types";

interface ToggleBlockProps {
  block: Block;
}

export const ToggleBlock: React.FC<ToggleBlockProps> = ({ block }) => {
  const { updateBlock, focusBlock } = useBlockStore();
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(block.properties.collapsed !== true);

  // Set initial title content
  useEffect(() => {
    if (titleRef.current && titleRef.current.textContent !== block.content) {
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const startOffset = range?.startOffset;
      
      titleRef.current.textContent = block.content;
      
      // Restore cursor position
      if (range && startOffset !== undefined) {
        try {
          const newRange = document.createRange();
          const textNode = titleRef.current.firstChild;
          if (textNode) {
            newRange.setStart(textNode, Math.min(startOffset, textNode.textContent?.length || 0));
            newRange.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
          }
        } catch (e) {
          // Ignore range errors
        }
      }
    }
  }, [block.content]);

  // Set initial child content
  useEffect(() => {
    const childContent = block.children?.[0]?.content || "";
    if (contentRef.current && contentRef.current.textContent !== childContent) {
      contentRef.current.textContent = childContent;
    }
  }, [block.children]);

  useEffect(() => {
    if (titleRef.current && !block.content) {
      titleRef.current.focus();
    }
  }, []);

  const handleTitleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent || "";
    updateBlock(block.id, { content });
  };

  const handleContentInput = (e: React.FormEvent<HTMLDivElement>) => {
    const children = e.currentTarget.textContent || "";
    updateBlock(block.id, {
      children: [
        {
          id: `${block.id}-content`,
          type: "paragraph",
          content: children,
          properties: {},
        },
      ],
    });
  };

  const handleFocus = () => {
    focusBlock(block.id);
  };

  const toggleOpen = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    updateBlock(block.id, {
      properties: { ...block.properties, collapsed: !newIsOpen },
    });
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      {/* Toggle header */}
      <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/50">
        <button
          onClick={toggleOpen}
          className="flex-shrink-0 p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          )}
        </button>

        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleTitleInput}
          onFocus={handleFocus}
          dir="ltr"
          className="flex-1 outline-none text-base font-medium text-neutral-900 dark:text-neutral-100 min-h-[1.5rem]"
          style={{
            direction: "ltr",
            unicodeBidi: "embed",
          }}
          data-placeholder="Toggle title"
        />
      </div>

      {/* Toggle content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
              <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleContentInput}
                dir="ltr"
                className="outline-none text-base text-neutral-700 dark:text-neutral-300 min-h-[3rem]"
                style={{
                  direction: "ltr",
                  unicodeBidi: "embed",
                }}
                data-placeholder="Toggle content..."
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

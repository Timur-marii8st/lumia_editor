import React, { useRef, useEffect } from "react";
import { useBlockStore } from "../../store/blockStore";
import type { Block } from "../../types";

interface QuoteBlockProps {
  block: Block;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ block }) => {
  const { updateBlock, focusBlock } = useBlockStore();
  const inputRef = useRef<HTMLDivElement>(null);

  // Set initial content only once
  useEffect(() => {
    if (inputRef.current && inputRef.current.textContent !== block.content) {
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const startOffset = range?.startOffset;
      
      inputRef.current.textContent = block.content;
      
      // Restore cursor position
      if (range && startOffset !== undefined) {
        try {
          const newRange = document.createRange();
          const textNode = inputRef.current.firstChild;
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

  useEffect(() => {
    if (inputRef.current && !block.content) {
      inputRef.current.focus();
    }
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent || "";
    updateBlock(block.id, { content });
  };

  const handleFocus = () => {
    focusBlock(block.id);
  };

  return (
    <div className="border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 py-1">
      <div
        ref={inputRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        dir="ltr"
        className="outline-none text-base text-neutral-700 dark:text-neutral-300 italic min-h-[1.5rem]"
        style={{
          color: block.properties.color,
          direction: "ltr",
          unicodeBidi: "embed",
        }}
        data-placeholder="Quote"
      />
    </div>
  );
};

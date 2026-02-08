import React, { useRef, useEffect } from "react";
import { useBlockStore } from "../../store/blockStore";
import type { Block } from "../../types";

interface ListBlockProps {
  block: Block;
}

export const ListBlock: React.FC<ListBlockProps> = ({ block }) => {
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

  const isBullet = block.type === "bulletList";

  return (
    <div className="flex items-start gap-2">
      <span className="flex-shrink-0 mt-1 text-neutral-600 dark:text-neutral-400">
        {isBullet ? "•" : "1."}
      </span>
      <div
        ref={inputRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        dir="ltr"
        className="flex-1 outline-none text-base text-neutral-900 dark:text-neutral-100 min-h-[1.5rem]"
        style={{
          color: block.properties.color,
          direction: "ltr",
          unicodeBidi: "embed",
        }}
        data-placeholder="List item"
      />
    </div>
  );
};

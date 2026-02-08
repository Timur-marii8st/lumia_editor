import React, { useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { useBlockStore } from "../../store/blockStore";
import type { Block } from "../../types";

interface TodoBlockProps {
  block: Block;
}

export const TodoBlock: React.FC<TodoBlockProps> = ({ block }) => {
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

  const toggleChecked = () => {
    updateBlock(block.id, {
      properties: {
        ...block.properties,
        checked: !block.properties.checked,
      },
    });
  };

  const isChecked = block.properties.checked || false;

  return (
    <div className="flex items-start gap-2">
      <button
        onClick={toggleChecked}
        className={`
          flex-shrink-0 mt-1 w-5 h-5 rounded border-2 flex items-center justify-center
          transition-all duration-200
          ${
            isChecked
              ? "bg-blue-500 border-blue-500"
              : "border-neutral-300 dark:border-neutral-600 hover:border-blue-400"
          }
        `}
      >
        {isChecked && <Check className="w-3 h-3 text-white" />}
      </button>
      <div
        ref={inputRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        dir="ltr"
        className={`
          flex-1 outline-none text-base min-h-[1.5rem]
          ${
            isChecked
              ? "line-through text-neutral-400 dark:text-neutral-600"
              : "text-neutral-900 dark:text-neutral-100"
          }
        `}
        style={{
          color: !isChecked ? block.properties.color : undefined,
          direction: "ltr",
          unicodeBidi: "embed",
        }}
        data-placeholder="To-do"
      />
    </div>
  );
};

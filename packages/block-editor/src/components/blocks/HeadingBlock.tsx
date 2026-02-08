import React, { useRef, useEffect } from "react";
import { useBlockStore } from "../../store/blockStore";
import type { Block } from "../../types";

interface HeadingBlockProps {
  block: Block;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ block }) => {
  const { updateBlock, focusBlock } = useBlockStore();
  const inputRef = useRef<HTMLDivElement>(null);

  // Set initial content only once
  useEffect(() => {
    if (inputRef.current && inputRef.current.textContent !== block.content) {
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const startOffset = range?.startOffset;
      const endOffset = range?.endOffset;
      
      inputRef.current.textContent = block.content;
      
      // Restore cursor position
      if (range && startOffset !== undefined && endOffset !== undefined) {
        try {
          const newRange = document.createRange();
          const textNode = inputRef.current.firstChild;
          if (textNode) {
            newRange.setStart(textNode, Math.min(startOffset, textNode.textContent?.length || 0));
            newRange.setEnd(textNode, Math.min(endOffset, textNode.textContent?.length || 0));
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

  const getHeadingStyles = () => {
    switch (block.type) {
      case "heading1":
        return "text-3xl font-bold";
      case "heading2":
        return "text-2xl font-bold";
      case "heading3":
        return "text-xl font-bold";
      default:
        return "text-xl font-bold";
    }
  };

  const getPlaceholder = () => {
    switch (block.type) {
      case "heading1":
        return "Heading 1";
      case "heading2":
        return "Heading 2";
      case "heading3":
        return "Heading 3";
      default:
        return "Heading";
    }
  };

  return (
    <div
      ref={inputRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onFocus={handleFocus}
      dir="ltr"
      className={`outline-none text-neutral-900 dark:text-neutral-100 min-h-[1.5rem] ${getHeadingStyles()}`}
      style={{
        textAlign: block.properties.align || "left",
        color: block.properties.color,
        direction: "ltr",
        unicodeBidi: "embed",
      }}
      data-placeholder={getPlaceholder()}
    />
  );
};

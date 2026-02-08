import React, { useRef, useEffect, useState } from "react";
import { useBlockStore } from "../../store/blockStore";
import { AIContextMenu } from "../AIContextMenu";
import type { Block } from "../../types";

interface ParagraphBlockProps {
  block: Block;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ block }) => {
  const { updateBlock, focusBlock, openSlashMenu } = useBlockStore();
  const inputRef = useRef<HTMLDivElement>(null);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiMenuPosition, setAIMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");

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
    
    // Check for slash command
    if (content.startsWith("/")) {
      const rect = e.currentTarget.getBoundingClientRect();
      openSlashMenu(
        { x: rect.left, y: rect.bottom + 5 },
        content.slice(1)
      );
    }
    
    updateBlock(block.id, { content });
  };

  const handleFocus = () => {
    focusBlock(block.id);
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      if (rect) {
        setSelectedText(text);
        setAIMenuPosition({
          x: rect.left + rect.width / 2 - 128, // Center menu (256px width / 2)
          y: rect.bottom + 10,
        });
        setShowAIMenu(true);
      }
    } else {
      setShowAIMenu(false);
    }
  };

  return (
    <>
      <div
        ref={inputRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onMouseUp={handleMouseUp}
        dir="ltr"
        className="outline-none text-base text-neutral-900 dark:text-neutral-100 min-h-[1.5rem]"
        style={{
          textAlign: block.properties.align || "left",
          color: block.properties.color,
          backgroundColor: block.properties.backgroundColor,
          direction: "ltr",
          unicodeBidi: "embed",
        }}
        data-placeholder="Type '/' for commands"
      />

      {showAIMenu && (
        <AIContextMenu
          blockId={block.id}
          selectedText={selectedText}
          position={aiMenuPosition}
          onClose={() => setShowAIMenu(false)}
        />
      )}
    </>
  );
};

import React, { useRef, useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { useBlockStore } from "../../store/blockStore";
import type { Block } from "../../types";

interface CodeBlockProps {
  block: Block;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ block }) => {
  const { updateBlock, focusBlock } = useBlockStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (inputRef.current && !block.content) {
      inputRef.current.focus();
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    updateBlock(block.id, { content });
  };

  const handleFocus = () => {
    focusBlock(block.id);
  };

  const handleCopy = async () => {
    if (block.content) {
      await navigator.clipboard.writeText(block.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const language = block.properties.language || "javascript";

  return (
    <div className="relative group/code">
      {/* Language selector and copy button */}
      <div className="flex items-center justify-between mb-2">
        <select
          value={language}
          onChange={(e) =>
            updateBlock(block.id, {
              properties: { ...block.properties, language: e.target.value },
            })
          }
          className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="rust">Rust</option>
          <option value="go">Go</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="json">JSON</option>
          <option value="markdown">Markdown</option>
          <option value="bash">Bash</option>
        </select>

        <button
          onClick={handleCopy}
          className="opacity-0 group-hover/code:opacity-100 transition-opacity p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-neutral-500" />
          )}
        </button>
      </div>

      {/* Code editor */}
      <textarea
        ref={inputRef}
        value={block.content || ""}
        onChange={handleInput}
        onFocus={handleFocus}
        placeholder="// Write your code here..."
        className="w-full min-h-[120px] p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono text-sm text-neutral-900 dark:text-neutral-100 outline-none resize-y"
        spellCheck={false}
      />
    </div>
  );
};

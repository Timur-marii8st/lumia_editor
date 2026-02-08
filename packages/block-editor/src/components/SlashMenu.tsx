import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Table,
  Image,
  Network,
  Target,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useBlockStore } from "../store/blockStore";
import { useAI } from "../hooks/useAI";
import { nanoid } from "nanoid";
import type { BlockType } from "../types";

interface SlashCommand {
  id: string;
  label: string;
  description: string;
  aliases: string[];
  icon: React.ReactNode;
  blockType: BlockType;
}

const slashCommands: SlashCommand[] = [
  {
    id: "paragraph",
    label: "Paragraph",
    description: "Plain text block",
    aliases: ["p", "text"],
    icon: <Type className="w-4 h-4" />,
    blockType: "paragraph",
  },
  {
    id: "heading1",
    label: "Heading 1",
    description: "Large section heading",
    aliases: ["h1", "#"],
    icon: <Heading1 className="w-4 h-4" />,
    blockType: "heading1",
  },
  {
    id: "heading2",
    label: "Heading 2",
    description: "Medium section heading",
    aliases: ["h2", "##"],
    icon: <Heading2 className="w-4 h-4" />,
    blockType: "heading2",
  },
  {
    id: "heading3",
    label: "Heading 3",
    description: "Small section heading",
    aliases: ["h3", "###"],
    icon: <Heading3 className="w-4 h-4" />,
    blockType: "heading3",
  },
  {
    id: "bulletList",
    label: "Bullet List",
    description: "Unordered list",
    aliases: ["ul", "bullet", "-"],
    icon: <List className="w-4 h-4" />,
    blockType: "bulletList",
  },
  {
    id: "numberedList",
    label: "Numbered List",
    description: "Ordered list",
    aliases: ["ol", "number", "1"],
    icon: <ListOrdered className="w-4 h-4" />,
    blockType: "numberedList",
  },
  {
    id: "todo",
    label: "To-do List",
    description: "Checklist",
    aliases: ["checkbox", "check", "[]"],
    icon: <CheckSquare className="w-4 h-4" />,
    blockType: "todo",
  },
  {
    id: "quote",
    label: "Quote",
    description: "Block quote",
    aliases: ["blockquote", ">"],
    icon: <Quote className="w-4 h-4" />,
    blockType: "quote",
  },
  {
    id: "code",
    label: "Code",
    description: "Code block",
    aliases: ["```", "codeblock"],
    icon: <Code className="w-4 h-4" />,
    blockType: "code",
  },
  {
    id: "divider",
    label: "Divider",
    description: "Horizontal line",
    aliases: ["hr", "---", "separator"],
    icon: <Minus className="w-4 h-4" />,
    blockType: "divider",
  },
  {
    id: "table",
    label: "Table",
    description: "Data table",
    aliases: ["grid"],
    icon: <Table className="w-4 h-4" />,
    blockType: "table",
  },
  {
    id: "image",
    label: "Image",
    description: "Upload or embed image",
    aliases: ["img", "picture"],
    icon: <Image className="w-4 h-4" />,
    blockType: "image",
  },
  {
    id: "graph",
    label: "2D Graph",
    description: "Interactive graph visualization",
    aliases: ["network", "nodes"],
    icon: <Network className="w-4 h-4" />,
    blockType: "graph",
  },
  {
    id: "lifeBalance",
    label: "Life Balance",
    description: "Life balance circle",
    aliases: ["balance", "wheel"],
    icon: <Target className="w-4 h-4" />,
    blockType: "lifeBalance",
  },
  {
    id: "callout",
    label: "Callout",
    description: "Highlighted text box",
    aliases: ["info", "note"],
    icon: <AlertCircle className="w-4 h-4" />,
    blockType: "callout",
  },
  {
    id: "toggle",
    label: "Toggle",
    description: "Collapsible section",
    aliases: ["collapse", "accordion"],
    icon: <ChevronRight className="w-4 h-4" />,
    blockType: "toggle",
  },
  {
    id: "ai-generate",
    label: "Ask AI",
    description: "Generate content with AI",
    aliases: ["ai", "generate", "gpt"],
    icon: <Sparkles className="w-4 h-4" />,
    blockType: "paragraph",
  },
];

export const SlashMenu: React.FC = () => {
  const { slashMenuPosition, slashMenuFilter, closeSlashMenu, addBlock } = useBlockStore();
  const { generateBlock } = useAI();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiInput, setShowAiInput] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter commands based on search
  const filteredCommands = slashCommands.filter((cmd) => {
    const searchTerm = slashMenuFilter.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchTerm) ||
      cmd.description.toLowerCase().includes(searchTerm) ||
      cmd.aliases.some((alias) => alias.toLowerCase().includes(searchTerm))
    );
  });

  // Reset selected index when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [slashMenuFilter]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelectCommand(filteredCommands[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeSlashMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filteredCommands, selectedIndex, closeSlashMenu]);

  const handleSelectCommand = (command: SlashCommand) => {
    if (command.id === "ai-generate") {
      setShowAiInput(true);
      return;
    }

    // Add new block with selected type
    addBlock({
      id: nanoid(),
      type: command.blockType,
      content: "",
      properties: {},
    });
    closeSlashMenu();
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;

    try {
      await generateBlock({ prompt: aiPrompt });
      setAiPrompt("");
      setShowAiInput(false);
      closeSlashMenu();
    } catch (error) {
      console.error("Failed to generate with AI:", error);
    }
  };

  if (!slashMenuPosition) return null;

  if (showAiInput) {
    return (
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
        style={{
          position: "fixed",
          left: slashMenuPosition.x,
          top: slashMenuPosition.y,
        }}
        className="w-96 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 p-4 z-50"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
            Ask AI to generate
          </h3>
        </div>
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAiGenerate();
            } else if (e.key === "Escape") {
              setShowAiInput(false);
              setAiPrompt("");
            }
          }}
          placeholder="Describe what you want to create..."
          className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-purple-500"
          autoFocus
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleAiGenerate}
            className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-medium transition-colors"
          >
            Generate
          </button>
          <button
            onClick={() => {
              setShowAiInput(false);
              setAiPrompt("");
            }}
            className="px-3 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "fixed",
        left: slashMenuPosition.x,
        top: slashMenuPosition.y,
      }}
      className="w-80 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-2 z-50 max-h-96 overflow-y-auto"
    >
      {filteredCommands.length === 0 ? (
        <div className="px-4 py-8 text-center text-neutral-400 dark:text-neutral-600">
          No commands found
        </div>
      ) : (
        filteredCommands.map((command, index) => (
          <button
            key={command.id}
            onClick={() => handleSelectCommand(command)}
            className={`
              w-full px-4 py-2 text-left flex items-center gap-3
              ${
                index === selectedIndex
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
              }
            `}
          >
            <div className="flex-shrink-0 text-neutral-600 dark:text-neutral-400">
              {command.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {command.label}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {command.description}
              </div>
            </div>
          </button>
        ))
      )}
    </motion.div>
  );
};

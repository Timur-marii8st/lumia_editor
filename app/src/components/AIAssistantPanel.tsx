import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, X, Sparkles, Trash2 } from "lucide-react";
import { Input, Button, Avatar } from "@lumia/ui";
import type { Editor } from "@tiptap/core";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useOllamaStore } from "@/store/ollamaStore";
import miaAvatar from "@/components/miachat/images/mia_avatar.png";

interface AIAssistantPanelProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  editor,
  isOpen,
  onClose,
}) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { selectedModel } = useOllamaStore();
  
  const { messages, isLoading, streamingContent, sendMessage, clearMessages } = useAIAssistant({
    editor,
    modelId: selectedModel,
    systemPrompt: `You are Mia, an AI assistant integrated into a text editor. You can help users write, edit, and organize their documents.

You have access to powerful tools that let you directly modify the document:
- insert_text: Insert text at cursor position
- replace_text: Replace selected or specified text
- delete_text: Delete text from document
- format_text: Apply formatting (bold, italic, headings, etc.)
- insert_table: Create tables
- insert_list: Create bullet or numbered lists
- insert_heading: Insert headings
- create_graph: Create 2D graph visualizations
- create_table_visualization: Create structured tables from data
- create_life_balance: Create life balance circle diagrams
- get_document_content: Read the current document
- search_document: Search for text in document

When users ask you to modify the document, use these tools proactively. Be helpful, concise, and friendly.`,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Mia AI Assistant
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearMessages}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            title="Clear chat"
          >
            <Trash2 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-neutral-500 dark:text-neutral-400 pt-10">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-pink-300" />
            <p className="text-sm">
              Hi! I'm Mia, your AI assistant.
              <br />
              I can help you edit and organize your document.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="flex items-start space-x-2 max-w-[85%]">
              {msg.role === "assistant" && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <img src={miaAvatar} alt="Mia" />
                </Avatar>
              )}
              <div
                className={`p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-pink-500 text-white rounded-br-none"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      🛠️ Used {msg.toolCalls.length} tool{msg.toolCalls.length > 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {isLoading && streamingContent && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-[85%]">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <img src={miaAvatar} alt="Mia" />
              </Avatar>
              <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-none">
                <p className="text-sm whitespace-pre-wrap break-words">
                  {streamingContent}
                  <span className="animate-pulse">▊</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <img src={miaAvatar} alt="Mia" />
              </Avatar>
              <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center space-x-2">
          <Input
            placeholder={isLoading ? "Mia is thinking..." : "Ask Mia anything..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-pink-500 hover:bg-pink-600 text-white"
            size="icon"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

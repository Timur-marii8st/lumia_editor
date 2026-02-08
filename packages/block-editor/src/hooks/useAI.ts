import { useState } from "react";
import { useBlockStore } from "../store/blockStore";
import { nanoid } from "nanoid";
import { parseVisualizationCommand, detectVisualization } from "../utils/visualizationParser";
import type { Block } from "../types";

interface AIGenerateOptions {
  prompt: string;
  blockType?: string;
  context?: string;
}

export const useAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { addBlock, updateBlock, blocks } = useBlockStore();

  const generateBlock = async (options: AIGenerateOptions) => {
    setIsGenerating(true);
    
    try {
      const ollamaUrl = localStorage.getItem("ollama_url") || "http://localhost:11434";
      const selectedModel = localStorage.getItem("ollama_selected_model") || "llama2";

      // Check if prompt describes a visualization
      if (detectVisualization(options.prompt)) {
        const visualizationBlock = await parseVisualizationCommand(
          options.prompt,
          ollamaUrl,
          selectedModel
        );

        if (visualizationBlock) {
          addBlock(visualizationBlock);
          return visualizationBlock;
        }
      }

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `Generate content for a ${options.blockType || "paragraph"} block based on this prompt: ${options.prompt}${options.context ? `\n\nContext: ${options.context}` : ""}\n\nRespond with ONLY the content, no explanations.`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      const content = data.response.trim();

      // Create new block with generated content
      const newBlock: Block = {
        id: nanoid(),
        type: (options.blockType as any) || "paragraph",
        content,
        properties: {},
      };

      addBlock(newBlock);
      return newBlock;
    } catch (error) {
      console.error("AI generation error:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const improveBlock = async (blockId: string) => {
    setIsGenerating(true);
    
    try {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) throw new Error("Block not found");

      const ollamaUrl = localStorage.getItem("ollama_url") || "http://localhost:11434";
      const selectedModel = localStorage.getItem("ollama_selected_model") || "llama2";

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `Improve this text while keeping the same meaning and tone:\n\n${block.content}\n\nRespond with ONLY the improved text, no explanations.`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to improve content");
      }

      const data = await response.json();
      const improvedContent = data.response.trim();

      updateBlock(blockId, { content: improvedContent });
      return improvedContent;
    } catch (error) {
      console.error("AI improvement error:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const summarizeBlocks = async (blockIds: string[]) => {
    setIsGenerating(true);
    
    try {
      const selectedBlocks = blocks.filter((b) => blockIds.includes(b.id));
      const combinedContent = selectedBlocks.map((b) => b.content).join("\n\n");

      const ollamaUrl = localStorage.getItem("ollama_url") || "http://localhost:11434";
      const selectedModel = localStorage.getItem("ollama_selected_model") || "llama2";

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `Summarize this content in a concise paragraph:\n\n${combinedContent}\n\nRespond with ONLY the summary, no explanations.`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to summarize content");
      }

      const data = await response.json();
      const summary = data.response.trim();

      // Add summary as new block
      const summaryBlock: Block = {
        id: nanoid(),
        type: "callout",
        content: summary,
        properties: { icon: "note" },
      };

      addBlock(summaryBlock);
      return summaryBlock;
    } catch (error) {
      console.error("AI summarization error:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const continueWriting = async (blockId: string) => {
    setIsGenerating(true);
    
    try {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) throw new Error("Block not found");

      const ollamaUrl = localStorage.getItem("ollama_url") || "http://localhost:11434";
      const selectedModel = localStorage.getItem("ollama_selected_model") || "llama2";

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `Continue writing from this text:\n\n${block.content}\n\nRespond with ONLY the continuation, no explanations.`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to continue writing");
      }

      const data = await response.json();
      const continuation = data.response.trim();

      // Add continuation as new block
      const blockIndex = blocks.findIndex((b) => b.id === blockId);
      const continuationBlock: Block = {
        id: nanoid(),
        type: "paragraph",
        content: continuation,
        properties: {},
      };

      addBlock(continuationBlock, blockIndex + 1);
      return continuationBlock;
    } catch (error) {
      console.error("AI continuation error:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateBlock,
    improveBlock,
    summarizeBlocks,
    continueWriting,
  };
};

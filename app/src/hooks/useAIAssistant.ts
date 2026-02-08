import { useState, useCallback, useRef } from "react";
import type { Editor } from "@tiptap/core";
import { OllamaClient, type OllamaMessage, type ToolCallData } from "@/lib/ai/ollama-client";
import { aiToolExecutor } from "@/lib/ai/tool-executor";
import type { ToolCall } from "@lumia/ai-tools";

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: ToolCallData[];
  timestamp: string;
}

export interface UseAIAssistantOptions {
  editor: Editor | null;
  ollamaUrl?: string;
  modelId?: string;
  systemPrompt?: string;
}

export function useAIAssistant(options: UseAIAssistantOptions) {
  const {
    editor,
    ollamaUrl = "http://localhost:11434",
    modelId = "llama3.2",
    systemPrompt = "You are Mia, a helpful AI assistant integrated into a text editor. You can help users write, edit, and organize their documents. You have access to tools that let you directly modify the document.",
  } = options;

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  
  const clientRef = useRef<OllamaClient>(
    new OllamaClient({ url: ollamaUrl, model: modelId })
  );

  // Update editor reference in tool executor
  if (editor) {
    aiToolExecutor.setEditor(editor);
  }

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      const newUserMessage: AIMessage = {
        id: `msg-${Date.now()}-user`,
        role: "user",
        content: userMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, newUserMessage]);
      setIsLoading(true);
      setStreamingContent("");

      try {
        // Build conversation history
        const conversationMessages: OllamaMessage[] = [
          { role: "system", content: systemPrompt },
          ...messages.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
          { role: "user", content: userMessage.trim() },
        ];

        // Get available tools
        const tools = aiToolExecutor.getAvailableTools();

        let assistantContent = "";
        let toolCalls: ToolCallData[] | undefined;

        // Stream response
        for await (const chunk of clientRef.current.streamChat(conversationMessages, tools)) {
          if (chunk.type === "content" && chunk.content) {
            assistantContent += chunk.content;
            setStreamingContent(assistantContent);
          } else if (chunk.type === "tool_call" && chunk.toolCalls) {
            toolCalls = chunk.toolCalls;
          }
        }

        // Handle tool calls if present
        if (toolCalls && toolCalls.length > 0) {
          console.log("[useAIAssistant] Executing tool calls:", toolCalls);

          const toolCallsToExecute: ToolCall[] = toolCalls.map((tc) => ({
            id: tc.id,
            name: tc.function.name,
            parameters: JSON.parse(tc.function.arguments),
          }));

          const toolResponses = await aiToolExecutor.executeTools(toolCallsToExecute);

          // Add tool results to conversation
          const toolResultMessages: OllamaMessage[] = toolResponses.map((response) => ({
            role: "tool",
            content: JSON.stringify(response.result),
          }));

          // Get final response after tool execution
          const finalMessages: OllamaMessage[] = [
            ...conversationMessages,
            {
              role: "assistant",
              content: assistantContent || "",
              tool_calls: toolCalls,
            } as OllamaMessage,
            ...toolResultMessages,
          ];

          let finalContent = "";
          for await (const chunk of clientRef.current.streamChat(finalMessages)) {
            if (chunk.type === "content" && chunk.content) {
              finalContent += chunk.content;
              setStreamingContent(finalContent);
            }
          }

          assistantContent = finalContent;
        }

        // Add assistant message
        const assistantMessage: AIMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: assistantContent,
          toolCalls,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("[useAIAssistant] Error:", error);
        
        const errorMessage: AIMessage = {
          id: `msg-${Date.now()}-error`,
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setStreamingContent("");
      }
    },
    [messages, isLoading, systemPrompt, editor]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    streamingContent,
    sendMessage,
    clearMessages,
  };
}

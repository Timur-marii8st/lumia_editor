import { z } from "zod";
import type { Editor } from "@tiptap/core";

/**
 * Base tool definition
 */
export interface ToolDefinition<TParams = any> {
  name: string;
  description: string;
  parameters: z.ZodSchema<TParams>;
  execute: (params: TParams, context: ToolContext) => Promise<ToolResult>;
}

/**
 * Context provided to tool execution
 */
export interface ToolContext {
  editor: Editor | null;
  documentId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Result of tool execution
 */
export interface ToolResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

/**
 * Tool call from LLM
 */
export interface ToolCall {
  id: string;
  name: string;
  parameters: any;
}

/**
 * Tool response to LLM
 */
export interface ToolResponse {
  id: string;
  result: ToolResult;
}

/**
 * Registry of all available tools
 */
export interface ToolRegistry {
  register(tool: ToolDefinition): void;
  get(name: string): ToolDefinition | undefined;
  getAll(): ToolDefinition[];
  execute(call: ToolCall, context: ToolContext): Promise<ToolResponse>;
  getOpenAIFunctions(): OpenAIFunction[];
}

/**
 * OpenAI function calling format
 */
export interface OpenAIFunction {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
}

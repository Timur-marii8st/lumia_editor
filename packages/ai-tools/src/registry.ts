import type {
  ToolDefinition,
  ToolRegistry as IToolRegistry,
  ToolCall,
  ToolContext,
  ToolResponse,
  OpenAIFunction,
} from "./types";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Central registry for all AI tools
 */
export class ToolRegistry implements IToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      console.warn(`Tool "${tool.name}" is already registered. Overwriting.`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  async execute(call: ToolCall, context: ToolContext): Promise<ToolResponse> {
    const tool = this.get(call.name);

    if (!tool) {
      return {
        id: call.id,
        result: {
          success: false,
          error: `Tool "${call.name}" not found`,
        },
      };
    }

    try {
      // Validate parameters
      const validatedParams = tool.parameters.parse(call.parameters);

      // Execute tool
      const result = await tool.execute(validatedParams, context);

      return {
        id: call.id,
        result,
      };
    } catch (error) {
      return {
        id: call.id,
        result: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Convert tools to OpenAI function calling format
   */
  getOpenAIFunctions(): OpenAIFunction[] {
    return this.getAll().map((tool) => {
      const schema = zodToJsonSchema(tool.parameters) as any;
      
      return {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: "object",
          properties: schema.properties || {},
          required: schema.required || [],
        },
      };
    });
  }
}

// Global singleton instance
export const toolRegistry = new ToolRegistry();

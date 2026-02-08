import type { Editor } from "@tiptap/core";
import { toolRegistry, type ToolCall, type ToolResponse, type ToolContext } from "@lumia/ai-tools";

/**
 * Execute AI tool calls in the context of the editor
 */
export class AIToolExecutor {
  private editor: Editor | null = null;

  setEditor(editor: Editor | null) {
    this.editor = editor;
  }

  async executeTool(call: ToolCall): Promise<ToolResponse> {
    const context: ToolContext = {
      editor: this.editor,
    };

    return await toolRegistry.execute(call, context);
  }

  async executeTools(calls: ToolCall[]): Promise<ToolResponse[]> {
    const responses: ToolResponse[] = [];

    for (const call of calls) {
      const response = await this.executeTool(call);
      responses.push(response);
    }

    return responses;
  }

  getAvailableTools() {
    return toolRegistry.getOpenAIFunctions();
  }
}

// Global singleton
export const aiToolExecutor = new AIToolExecutor();

import type { OpenAIFunction } from "@lumia/ai-tools";

export interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: ToolCallData[];
}

export interface ToolCallData {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface OllamaConfig {
  url: string;
  model: string;
  temperature?: number;
}

export interface StreamChunk {
  type: "content" | "tool_call" | "done";
  content?: string;
  toolCalls?: ToolCallData[];
}

export class OllamaClient {
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    this.config = config;
  }

  async *streamChat(
    messages: OllamaMessage[],
    tools?: OpenAIFunction[]
  ): AsyncGenerator<StreamChunk> {
    const body: any = {
      model: this.config.model,
      messages,
      stream: true,
      options: {
        temperature: this.config.temperature ?? 0.7,
      },
    };

    // Add tools if provided
    if (tools && tools.length > 0) {
      body.tools = tools.map(tool => ({
        type: "function",
        function: tool,
      }));
    }

    console.log("[OllamaClient] Request:", JSON.stringify(body, null, 2));

    const response = await fetch(`${this.config.url}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get response reader");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let accumulatedToolCalls: ToolCallData[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const json = JSON.parse(line);

            // Handle content
            if (json.message?.content) {
              yield { type: "content", content: json.message.content };
            }

            // Handle tool calls
            if (json.message?.tool_calls) {
              for (const toolCall of json.message.tool_calls) {
                const formattedCall: ToolCallData = {
                  id: toolCall.id || `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                  type: "function",
                  function: {
                    name: toolCall.function.name,
                    arguments: typeof toolCall.function.arguments === "string" 
                      ? toolCall.function.arguments 
                      : JSON.stringify(toolCall.function.arguments),
                  },
                };
                accumulatedToolCalls.push(formattedCall);
              }
            }

            // Check if done
            if (json.done) {
              if (accumulatedToolCalls.length > 0) {
                yield { type: "tool_call", toolCalls: accumulatedToolCalls };
              }
              yield { type: "done" };
              return;
            }
          } catch (e) {
            console.error("[OllamaClient] Parse error:", e, "Line:", line);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async chat(messages: OllamaMessage[], tools?: OpenAIFunction[]): Promise<{
    content: string;
    toolCalls?: ToolCallData[];
  }> {
    let content = "";
    let toolCalls: ToolCallData[] | undefined;

    for await (const chunk of this.streamChat(messages, tools)) {
      if (chunk.type === "content" && chunk.content) {
        content += chunk.content;
      } else if (chunk.type === "tool_call" && chunk.toolCalls) {
        toolCalls = chunk.toolCalls;
      }
    }

    return { content, toolCalls };
  }

  // Check if Ollama is running
  static async isRunning(url: string = "http://localhost:11434"): Promise<boolean> {
    try {
      const response = await fetch(`${url}/api/tags`, {
        method: "GET",
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get available models
  static async getModels(url: string = "http://localhost:11434"): Promise<string[]> {
    try {
      const response = await fetch(`${url}/api/tags`, {
        method: "GET",
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch {
      return [];
    }
  }
}

import { Command } from "@tauri-apps/api/shell";

export interface OllamaStatus {
  isRunning: boolean;
  isInstalled: boolean;
  models: string[];
}

export class OllamaManager {
  private static instance: OllamaManager;
  private ollamaUrl = "http://localhost:11434";
  private checkInterval: number | null = null;

  private constructor() {}

  static getInstance(): OllamaManager {
    if (!OllamaManager.instance) {
      OllamaManager.instance = new OllamaManager();
    }
    return OllamaManager.instance;
  }

  // Check if Ollama is installed
  async isInstalled(): Promise<boolean> {
    try {
      // Try to run ollama --version
      const command = new Command("ollama", ["--version"]);
      const output = await command.execute();
      return output.code === 0;
    } catch (error) {
      console.error("[OllamaManager] Check installation error:", error);
      return false;
    }
  }

  // Check if Ollama server is running
  async isRunning(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Start Ollama server
  async start(): Promise<{ success: boolean; message: string }> {
    try {
      // Check if already running
      const running = await this.isRunning();
      if (running) {
        return { success: true, message: "Ollama is already running" };
      }

      // Check if installed
      const installed = await this.isInstalled();
      if (!installed) {
        return { 
          success: false, 
          message: "Ollama is not installed. Please install from https://ollama.ai" 
        };
      }

      // Start Ollama serve in background
      const command = new Command("ollama", ["serve"]);
      
      // Don't wait for the command to finish (it runs as a server)
      command.spawn();

      // Wait a bit and check if it started
      await new Promise(resolve => setTimeout(resolve, 2000));

      const isNowRunning = await this.isRunning();
      
      if (isNowRunning) {
        return { success: true, message: "Ollama server started successfully" };
      } else {
        return { 
          success: false, 
          message: "Failed to start Ollama server. Please start it manually with 'ollama serve'" 
        };
      }
    } catch (error) {
      console.error("[OllamaManager] Start error:", error);
      return { 
        success: false, 
        message: `Error starting Ollama: ${error instanceof Error ? error.message : "Unknown error"}` 
      };
    }
  }

  // Get available models
  async getModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`, {
        method: "GET",
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch {
      return [];
    }
  }

  // Pull a model
  async pullModel(modelName: string, onProgress?: (progress: number) => void): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modelName, stream: true }),
      });

      if (!response.ok) return false;

      const reader = response.body?.getReader();
      if (!reader) return false;

      const decoder = new TextDecoder();
      let buffer = "";

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
            if (json.total && json.completed && onProgress) {
              const progress = (json.completed / json.total) * 100;
              onProgress(progress);
            }
          } catch (e) {
            console.error("[OllamaManager] Parse progress error:", e);
          }
        }
      }

      return true;
    } catch (error) {
      console.error("[OllamaManager] Pull model error:", error);
      return false;
    }
  }

  // Get status
  async getStatus(): Promise<OllamaStatus> {
    const isInstalled = await this.isInstalled();
    const isRunning = await this.isRunning();
    const models = isRunning ? await this.getModels() : [];

    return {
      isInstalled,
      isRunning,
      models,
    };
  }

  // Start monitoring
  startMonitoring(callback: (status: OllamaStatus) => void, interval: number = 5000) {
    if (this.checkInterval) {
      this.stopMonitoring();
    }

    // Initial check
    this.getStatus().then(callback);

    // Periodic checks
    this.checkInterval = window.setInterval(async () => {
      const status = await this.getStatus();
      callback(status);
    }, interval);
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const ollamaManager = OllamaManager.getInstance();

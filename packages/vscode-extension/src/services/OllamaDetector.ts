/**
 * Ollama Detector
 * Auto-detects local Ollama installation and running models
 */

export interface OllamaInfo {
  available: boolean;
  running: boolean;
  baseUrl: string;
  models: Array<{ name: string; size: string }>;
}

export class OllamaDetector {
  private static instance: OllamaDetector;
  private readonly baseUrl = 'http://localhost:11434';
  private cachedInfo: OllamaInfo | undefined;
  private cacheExpiresAt = 0;
  private readonly cacheTtlMs = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): OllamaDetector {
    if (!OllamaDetector.instance) {
      OllamaDetector.instance = new OllamaDetector();
    }
    return OllamaDetector.instance;
  }

  /**
   * Detect if Ollama is running locally
   */
  async detect(): Promise<OllamaInfo> {
    // Return cached result if still valid
    if (this.cachedInfo && Date.now() < this.cacheExpiresAt) {
      return this.cachedInfo;
    }

    const info: OllamaInfo = {
      available: false,
      running: false,
      baseUrl: this.baseUrl,
      models: [],
    };

    try {
      // Test basic connectivity
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        this.cachedInfo = info;
        this.cacheExpiresAt = Date.now() + this.cacheTtlMs;
        return info;
      }

      const data = (await response.json()) as any;
      info.available = true;
      info.running = true;

      // Parse models
      if (Array.isArray(data.models)) {
        info.models = data.models.map((model: any) => ({
          name: model.name || model.model,
          size: this.formatBytes(model.size || 0),
        }));
      }
    } catch (error) {
      // Ollama not running or not installed
      info.available = false;
      info.running = false;
    }

    this.cachedInfo = info;
    this.cacheExpiresAt = Date.now() + this.cacheTtlMs;
    return info;
  }

  /**
   * Format bytes to human readable size
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if specific model is available
   */
  async hasModel(modelName: string): Promise<boolean> {
    const info = await this.detect();
    return info.models.some((m) => m.name.includes(modelName));
  }

  /**
   * Get recommended Ollama models
   */
  getRecommendedModels(): string[] {
    return [
      'neural-chat',      // Balanced, good quality
      'mistral',          // Fast, good for code
      'llama2',           // General purpose
      'orca-mini',        // Small, fast
      'dolphin-mixtral',  // Advanced reasoning
    ];
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cachedInfo = undefined;
    this.cacheExpiresAt = 0;
  }
}

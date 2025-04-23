import { 
  ModelListResponse, 
  OllamaModel, 
  StatusResponse,
  GenerationOptions,
  ModelPullOptions
} from "./types";

// Define pull progress response types
export interface PullProgressResponse {
  status: string;
  completed?: number;
  total?: number;
  digest?: string;
}

class OllamaService {
  private apiUrl: string;
  // Track installation progress for models
  private modelInstallProgress: Map<string, { completed: number, total: number }>;
  private progressCallbacks: Map<string, (progress: number, status: string) => void>;

  constructor(apiEndpoint: string = "http://localhost:11434") {
    this.apiUrl = apiEndpoint;
    this.modelInstallProgress = new Map();
    this.progressCallbacks = new Map();
  }

  /**
   * Set the API endpoint for Ollama
   */
  setApiEndpoint(endpoint: string) {
    this.apiUrl = endpoint;
  }

  /**
   * Check if the Ollama service is running
   */
  async checkOllamaStatus(): Promise<StatusResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/api/version`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return {
          status: 'success',
          message: 'Ollama service is running'
        };
      } else {
        return {
          status: 'error',
          message: `Ollama service responded with status: ${response.status}`
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Could not connect to Ollama service. Please make sure the Ollama app is running.'
      };
    }
  }

  /**
   * List all available models on the system
   */
  async listModels(): Promise<ModelListResponse | null> {
    try {
      const response = await fetch(`${this.apiUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Error listing models:', await response.text());
        return null;
      }
    } catch (error) {
      console.error('Network error listing models:', error);
      return null;
    }
  }

  /**
   * Register a progress callback for a model installation
   * @param modelName The name of the model being installed
   * @param callback Function to call with progress updates
   */
  registerProgressCallback(modelName: string, callback: (progress: number, status: string) => void) {
    this.progressCallbacks.set(modelName, callback);
    
    // If we already have progress data, call the callback immediately
    const progress = this.modelInstallProgress.get(modelName);
    if (progress) {
      const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
      callback(percent, 'downloading');
    }
  }

  /**
   * Unregister a progress callback
   */
  unregisterProgressCallback(modelName: string) {
    this.progressCallbacks.delete(modelName);
  }

  /**
   * Get current installation progress for a model
   */
  getInstallProgress(modelName: string): { progress: number, status: string } | null {
    const progress = this.modelInstallProgress.get(modelName);
    if (!progress) return null;
    
    return {
      progress: progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0,
      status: 'downloading'
    };
  }

  /**
   * Clear installation progress data for a model
   */
  clearInstallProgress(modelName: string) {
    this.modelInstallProgress.delete(modelName);
    this.unregisterProgressCallback(modelName);
  }

  /**
   * Pull a model from the Ollama registry with progress tracking
   */
  async pullModel(options: ModelPullOptions): Promise<Response> {
    const { name, stream = true } = options;
    
    // Clear any existing progress data
    this.modelInstallProgress.set(name, { completed: 0, total: 100 }); // Start with default values
    
    try {
      const response = await fetch(`${this.apiUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });
      
      if (!response.ok || !stream) {
        return response;
      }

      // Handle streaming response for progress updates
      const reader = response.body?.getReader();
      if (!reader) return response;
      
      // Process the stream
      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Parse the chunks
          const text = new TextDecoder().decode(value);
          const lines = text.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line) as PullProgressResponse;
              
              // Update progress
              if (data.completed !== undefined && data.total !== undefined) {
                const progress = {
                  completed: data.completed,
                  total: data.total
                };
                
                this.modelInstallProgress.set(name, progress);
                
                // Notify any registered callbacks
                const callback = this.progressCallbacks.get(name);
                if (callback) {
                  const percent = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                  callback(percent, data.status || 'downloading');
                }
              }
            } catch (e) {
              console.error('Error parsing model pull progress:', e);
            }
          }
        }
      };
      
      // Start processing the stream but don't wait for it
      processStream().catch(err => console.error('Error processing stream:', err));
      
      return response;
    } catch (error) {
      console.error('Error pulling model:', error);
      throw error;
    }
  }

  /**
   * Generate a completion with a model
   */
  async generateCompletion(options: GenerationOptions): Promise<Response> {
    return fetch(`${this.apiUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
  }

  /**
   * Delete a model from the system
   */
  async deleteModel(name: string): Promise<StatusResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/api/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        return {
          status: 'success',
          message: `Model ${name} deleted successfully`
        };
      } else {
        const errorText = await response.text();
        return {
          status: 'error',
          message: `Error deleting model: ${errorText}`
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Network error deleting model: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

// Create a singleton instance
const ollamaService = new OllamaService();
export default ollamaService;
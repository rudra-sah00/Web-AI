export interface OllamaLibraryModel {
  name: string;
  description: string;
  tags: string[];
  pulls: number;
  size?: string;
  updated_at: string;
  digest?: string;
}

class OllamaLibraryService {
  private readonly OLLAMA_LIBRARY_API = 'https://registry.ollama.ai/v2';
  
  /**
   * Search models from Ollama's official registry
   */
  async searchModels(query: string, limit: number = 20): Promise<OllamaLibraryModel[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      // Use Ollama's search API endpoint
      const response = await fetch(`${this.OLLAMA_LIBRARY_API}/models?q=${encodeURIComponent(query)}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Web-AI/1.0'
        }
      });

      if (!response.ok) {
        console.warn('Ollama API not available, using fallback search');
        return this.fallbackSearch(query);
      }

      const data = await response.json();
      return this.transformModels(data.models || []);
      
    } catch (error) {
      console.warn('Error fetching from Ollama API, using fallback:', error);
      return this.fallbackSearch(query);
    }
  }

  /**
   * Get popular/featured models (fallback when no search)
   */
  async getFeaturedModels(): Promise<OllamaLibraryModel[]> {
    try {
      const response = await fetch(`${this.OLLAMA_LIBRARY_API}/models/featured`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Web-AI/1.0'
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return this.transformModels(data.models || []);
      
    } catch (error) {
      console.warn('Error fetching featured models:', error);
      return [];
    }
  }

  /**
   * Transform API response to our model format
   */
  private transformModels(models: any[]): OllamaLibraryModel[] {
    return models.map(model => ({
      name: model.name || model.id,
      description: model.description || 'No description available',
      tags: model.tags || this.extractTags(model.name),
      pulls: model.pulls || 0,
      size: model.size || this.estimateSize(model.name),
      updated_at: model.updated_at || new Date().toISOString(),
      digest: model.digest
    }));
  }

  /**
   * Extract meaningful tags from model name
   */
  private extractTags(name: string): string[] {
    const tags = [];
    
    if (name.includes('llama')) tags.push('llama', 'meta');
    if (name.includes('mistral')) tags.push('mistral', 'mixtral');
    if (name.includes('gemma')) tags.push('gemma', 'google');
    if (name.includes('qwen')) tags.push('qwen', 'alibaba');
    if (name.includes('code')) tags.push('code', 'programming');
    if (name.includes('instruct')) tags.push('instruct', 'chat');
    if (name.includes('vision')) tags.push('vision', 'multimodal');
    if (name.includes('embed')) tags.push('embedding', 'similarity');
    
    // Add size tags
    if (name.includes('1b') || name.includes('1B')) tags.push('small', '1B');
    if (name.includes('3b') || name.includes('3B')) tags.push('small', '3B');
    if (name.includes('7b') || name.includes('7B')) tags.push('medium', '7B');
    if (name.includes('13b') || name.includes('13B')) tags.push('large', '13B');
    if (name.includes('70b') || name.includes('70B')) tags.push('large', '70B');
    
    return tags;
  }

  /**
   * Estimate model size based on name
   */
  private estimateSize(name: string): string {
    if (name.includes('1b') || name.includes('1B')) return '1.3 GB';
    if (name.includes('3b') || name.includes('3B')) return '2.0 GB';
    if (name.includes('7b') || name.includes('7B')) return '4.7 GB';
    if (name.includes('13b') || name.includes('13B')) return '7.4 GB';
    if (name.includes('30b') || name.includes('30B')) return '17 GB';
    if (name.includes('70b') || name.includes('70B')) return '40 GB';
    return 'Unknown';
  }

  /**
   * Fallback search using our static model list
   */
  private fallbackSearch(query: string): OllamaLibraryModel[] {
    const staticModels: OllamaLibraryModel[] = [
      {
        name: "llama3.2:3b",
        description: "Meta's Llama 3.2 3B parameter model - efficient and capable for general use",
        tags: ["llama", "meta", "efficient", "general", "3B"],
        pulls: 50000,
        size: "2.0 GB",
        updated_at: "2024-12-01T00:00:00Z"
      },
      {
        name: "llama3.2:1b",
        description: "Meta's Llama 3.2 1B parameter model - ultra-efficient for lightweight tasks",
        tags: ["llama", "meta", "small", "efficient", "1B"],
        pulls: 75000,
        size: "1.3 GB",
        updated_at: "2024-12-01T00:00:00Z"
      },
      {
        name: "gemma2:9b",
        description: "Google's Gemma 2 9B model with improved reasoning capabilities",
        tags: ["gemma", "google", "reasoning", "efficient", "9B"],
        pulls: 30000,
        size: "5.4 GB",
        updated_at: "2024-11-15T00:00:00Z"
      },
      {
        name: "mistral:7b",
        description: "Mistral 7B model optimized for instruction following and coding",
        tags: ["mistral", "instruct", "code", "7B"],
        pulls: 45000,
        size: "4.7 GB",
        updated_at: "2024-11-20T00:00:00Z"
      },
      {
        name: "qwen2.5:7b",
        description: "Alibaba's Qwen 2.5 7B model with strong multilingual capabilities",
        tags: ["qwen", "alibaba", "multilingual", "7B"],
        pulls: 25000,
        size: "4.7 GB",
        updated_at: "2024-11-10T00:00:00Z"
      },
      {
        name: "codellama:7b",
        description: "Meta's Code Llama 7B specialized for code generation and completion",
        tags: ["llama", "meta", "code", "programming", "7B"],
        pulls: 60000,
        size: "4.7 GB",
        updated_at: "2024-10-25T00:00:00Z"
      },
      {
        name: "phi3:mini",
        description: "Microsoft's Phi-3 Mini model - compact yet powerful for various tasks",
        tags: ["phi", "microsoft", "mini", "compact", "3B"],
        pulls: 35000,
        size: "2.3 GB",
        updated_at: "2024-11-05T00:00:00Z"
      },
      {
        name: "llava:7b",
        description: "Large Language and Vision Assistant - multimodal model for image understanding",
        tags: ["llava", "vision", "multimodal", "image", "7B"],
        pulls: 40000,
        size: "4.7 GB",
        updated_at: "2024-10-30T00:00:00Z"
      }
    ];

    const lowerQuery = query.toLowerCase();
    return staticModels.filter(model => 
      model.name.toLowerCase().includes(lowerQuery) ||
      model.description.toLowerCase().includes(lowerQuery) ||
      model.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}

const ollamaLibraryService = new OllamaLibraryService();
export default ollamaLibraryService;

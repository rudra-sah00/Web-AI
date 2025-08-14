import { StatusResponse } from './types';

export interface OllamaLibraryModel {
  name: string;
  description: string;
  tags?: string[];
  size?: string;
  parameterCount?: string;
}

class ModelSearchService {
  // Base URL for Ollama's model library API
  private readonly OLLAMA_LIBRARY_URL = 'https://ollama.ai/library';
  
  /**
   * Fetches the full list of models from the Ollama library
   */
  async fetchAllModels(): Promise<OllamaLibraryModel[]> {
    try {
      // In a real implementation, this would fetch from a real API
      // For now we'll use a static set of popular models
      return this.getStaticModelList();
    } catch (error) {
      console.error('Error fetching models from Ollama library:', error);
      return [];
    }
  }
  
  /**
   * Searches for models matching the query
   */
  async searchModels(query: string): Promise<OllamaLibraryModel[]> {
    try {
      const allModels = await this.fetchAllModels();
      if (!query) return allModels;
      
      const lowerQuery = query.toLowerCase();
      return allModels.filter(model => 
        model.name.toLowerCase().includes(lowerQuery) || 
        model.description.toLowerCase().includes(lowerQuery) ||
        (model.tags && model.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );
    } catch (error) {
      console.error('Error searching models:', error);
      return [];
    }
  }
  
  /**
   * Gets model details by name
   */
  async getModelDetails(name: string): Promise<OllamaLibraryModel | null> {
    try {
      const models = await this.fetchAllModels();
      return models.find(model => model.name === name) || null;
    } catch (error) {
      console.error('Error getting model details:', error);
      return null;
    }
  }
  
  /**
   * Returns a standardized model ID suitable for Ollama
   */
  getStandardModelId(name: string): string {
    // Remove any special formatting and return just the model name/tag
    return name.replace(/\s+/g, '').toLowerCase();
  }
  
  /**
   * Returns a static list of popular Ollama models
   * In a production app, this would be fetched from Ollama's API
   */
  private getStaticModelList(): OllamaLibraryModel[] {
    return [
      // Large Language Models
      {
        name: "llama3.2:3b",
        description: "Meta's Llama 3.2 3B parameter model - efficient and capable",
        tags: ["llama", "meta", "efficient", "general"],
        parameterCount: "3B",
        size: "2.0 GB"
      },
      {
        name: "llama3.2:1b",
        description: "Meta's Llama 3.2 1B parameter model - ultra-efficient",
        tags: ["llama", "meta", "small", "efficient"],
        parameterCount: "1B",
        size: "1.3 GB"
      },
      {
        name: "llama3.1:8b",
        description: "Meta's Llama 3.1 8B parameter model with improved capabilities",
        tags: ["llama", "meta", "capable", "general"],
        parameterCount: "8B",
        size: "4.7 GB"
      },
      {
        name: "llama3.1:70b",
        description: "Meta's largest Llama 3.1 model with exceptional performance",
        tags: ["llama", "meta", "large", "powerful"],
        parameterCount: "70B",
        size: "40 GB"
      },
      {
        name: "mistral:7b",
        description: "Mistral AI's 7B parameter model with strong performance",
        tags: ["mistral", "efficient", "general"],
        parameterCount: "7B",
        size: "4.1 GB"
      },
      {
        name: "mixtral:8x7b",
        description: "Mistral's mixture of experts model with 8x7B parameters",
        tags: ["mistral", "mixture-of-experts", "powerful"],
        parameterCount: "8x7B",
        size: "26 GB"
      },
      {
        name: "phi3:3.8b",
        description: "Microsoft's Phi-3 model optimized for efficiency",
        tags: ["microsoft", "phi", "efficient", "small"],
        parameterCount: "3.8B",
        size: "2.3 GB"
      },
      {
        name: "phi3:14b",
        description: "Microsoft's larger Phi-3 model with enhanced capabilities",
        tags: ["microsoft", "phi", "capable"],
        parameterCount: "14B",
        size: "7.9 GB"
      },
      {
        name: "gemma2:2b",
        description: "Google's Gemma 2 2B model - compact and efficient",
        tags: ["google", "gemma", "small", "efficient"],
        parameterCount: "2B",
        size: "1.6 GB"
      },
      {
        name: "gemma2:9b",
        description: "Google's Gemma 2 9B model with improved performance",
        tags: ["google", "gemma", "capable"],
        parameterCount: "9B",
        size: "5.4 GB"
      },
      {
        name: "gemma2:27b",
        description: "Google's largest Gemma 2 model with advanced capabilities",
        tags: ["google", "gemma", "large", "powerful"],
        parameterCount: "27B",
        size: "16 GB"
      },
      {
        name: "qwen2.5:0.5b",
        description: "Alibaba's ultra-efficient Qwen 2.5 model",
        tags: ["qwen", "alibaba", "tiny", "efficient"],
        parameterCount: "0.5B",
        size: "394 MB"
      },
      {
        name: "qwen2.5:1.5b",
        description: "Alibaba's compact Qwen 2.5 model",
        tags: ["qwen", "alibaba", "small", "efficient"],
        parameterCount: "1.5B",
        size: "934 MB"
      },
      {
        name: "qwen2.5:3b",
        description: "Alibaba's balanced Qwen 2.5 model",
        tags: ["qwen", "alibaba", "efficient"],
        parameterCount: "3B",
        size: "1.9 GB"
      },
      {
        name: "qwen2.5:7b",
        description: "Alibaba's capable Qwen 2.5 model",
        tags: ["qwen", "alibaba", "capable"],
        parameterCount: "7B",
        size: "4.4 GB"
      },
      {
        name: "qwen2.5:14b",
        description: "Alibaba's advanced Qwen 2.5 model",
        tags: ["qwen", "alibaba", "large"],
        parameterCount: "14B",
        size: "8.2 GB"
      },
      {
        name: "qwen2.5:32b",
        description: "Alibaba's most capable Qwen 2.5 model",
        tags: ["qwen", "alibaba", "powerful"],
        parameterCount: "32B",
        size: "19 GB"
      },
      {
        name: "qwen2.5:72b",
        description: "Alibaba's flagship Qwen 2.5 model",
        tags: ["qwen", "alibaba", "flagship"],
        parameterCount: "72B",
        size: "41 GB"
      },
      
      // Code-specialized models
      {
        name: "codellama:7b",
        description: "Meta's Code Llama for code generation and understanding",
        tags: ["code", "programming", "llama", "meta"],
        parameterCount: "7B",
        size: "3.8 GB"
      },
      {
        name: "codellama:13b",
        description: "Meta's larger Code Llama model with enhanced coding abilities",
        tags: ["code", "programming", "llama", "meta"],
        parameterCount: "13B",
        size: "7.3 GB"
      },
      {
        name: "codellama:34b",
        description: "Meta's most capable Code Llama model",
        tags: ["code", "programming", "llama", "meta", "large"],
        parameterCount: "34B",
        size: "19 GB"
      },
      {
        name: "codeqwen:7b",
        description: "Alibaba's Qwen model specialized for coding tasks",
        tags: ["code", "programming", "qwen", "alibaba"],
        parameterCount: "7B",
        size: "4.2 GB"
      },
      {
        name: "starcoder2:3b",
        description: "StarCoder2 3B model for code generation",
        tags: ["code", "programming", "starcoder"],
        parameterCount: "3B",
        size: "1.7 GB"
      },
      {
        name: "starcoder2:7b",
        description: "StarCoder2 7B model with enhanced code capabilities",
        tags: ["code", "programming", "starcoder"],
        parameterCount: "7B",
        size: "4.0 GB"
      },
      {
        name: "starcoder2:15b",
        description: "StarCoder2 15B model for advanced code tasks",
        tags: ["code", "programming", "starcoder", "large"],
        parameterCount: "15B",
        size: "8.6 GB"
      },
      
      // Multimodal models
      {
        name: "llava:7b",
        description: "Large Language and Vision Assistant - multimodal AI",
        tags: ["multimodal", "vision", "llava"],
        parameterCount: "7B",
        size: "4.5 GB"
      },
      {
        name: "llava:13b",
        description: "Larger LLaVA model with enhanced vision capabilities",
        tags: ["multimodal", "vision", "llava", "large"],
        parameterCount: "13B",
        size: "7.8 GB"
      },
      {
        name: "llava:34b",
        description: "Most capable LLaVA model for complex multimodal tasks",
        tags: ["multimodal", "vision", "llava", "powerful"],
        parameterCount: "34B",
        size: "20 GB"
      },
      {
        name: "llava-llama3:8b",
        description: "LLaVA based on Llama 3 architecture",
        tags: ["multimodal", "vision", "llava", "llama"],
        parameterCount: "8B",
        size: "5.2 GB"
      },
      
      // Specialized models
      {
        name: "nomic-embed-text",
        description: "Nomic's text embedding model for semantic search",
        tags: ["embedding", "search", "nomic"],
        parameterCount: "137M",
        size: "274 MB"
      },
      {
        name: "all-minilm",
        description: "Sentence transformer for text embeddings",
        tags: ["embedding", "sentence-transformer"],
        parameterCount: "22M",
        size: "45 MB"
      },
      {
        name: "dolphin-mistral:7b",
        description: "Uncensored Mistral model fine-tuned by Eric Hartford",
        tags: ["mistral", "uncensored", "dolphin"],
        parameterCount: "7B",
        size: "4.1 GB"
      },
      {
        name: "neural-chat:7b",
        description: "Intel's neural chat model for conversational AI",
        tags: ["chat", "conversation", "intel"],
        parameterCount: "7B",
        size: "4.1 GB"
      },
      {
        name: "orca-mini:3b",
        description: "Microsoft's Orca model compressed to 3B parameters",
        tags: ["orca", "microsoft", "efficient"],
        parameterCount: "3B",
        size: "1.9 GB"
      },
      {
        name: "orca-mini:7b",
        description: "Microsoft's Orca model with strong reasoning capabilities",
        tags: ["orca", "microsoft", "reasoning"],
        parameterCount: "7B",
        size: "3.8 GB"
      },
      {
        name: "orca-mini:13b",
        description: "Larger Orca model with enhanced performance",
        tags: ["orca", "microsoft", "reasoning", "large"],
        parameterCount: "13B",
        size: "7.3 GB"
      },
      {
        name: "vicuna:7b",
        description: "UC Berkeley's Vicuna model trained on user conversations",
        tags: ["vicuna", "berkeley", "conversation"],
        parameterCount: "7B",
        size: "3.8 GB"
      },
      {
        name: "vicuna:13b",
        description: "Larger Vicuna model with improved chat capabilities",
        tags: ["vicuna", "berkeley", "conversation", "large"],
        parameterCount: "13B",
        size: "7.3 GB"
      },
      {
        name: "zephyr:7b",
        description: "HuggingFace's Zephyr model fine-tuned for helpfulness",
        tags: ["zephyr", "huggingface", "helpful"],
        parameterCount: "7B",
        size: "4.1 GB"
      }
    ];
  }
}

const modelSearchService = new ModelSearchService();
export default modelSearchService;
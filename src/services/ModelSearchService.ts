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
      {
        name: "llama3",
        description: "Meta's newest open-source LLM, known for outstanding instruction following and reasoning",
        tags: ["latest", "recommended", "general"],
        parameterCount: "8B",
        size: "4.7 GB"
      },
      {
        name: "llama3:8b",
        description: "Meta's newest open-source LLM (8B version)",
        tags: ["latest", "general"],
        parameterCount: "8B",
        size: "4.7 GB"
      },
      {
        name: "llama3:70b",
        description: "Meta's newest and most powerful open-source LLM",
        tags: ["latest", "powerful"],
        parameterCount: "70B",
        size: "39 GB"
      },
      {
        name: "mistral",
        description: "Mistral 7B is a strong base model with great performance",
        tags: ["general"],
        parameterCount: "7B",
        size: "4.1 GB"
      },
      {
        name: "mistral:instruct",
        description: "Mistral with instruction tuning for better task completion",
        tags: ["instruction", "recommended"],
        parameterCount: "7B",
        size: "4.1 GB"
      },
      {
        name: "codellama",
        description: "Code-specialized model for programming tasks",
        tags: ["code", "programming"],
        parameterCount: "7B",
        size: "3.8 GB"
      },
      {
        name: "codellama:13b",
        description: "Larger, more capable code-specialized model",
        tags: ["code", "programming"],
        parameterCount: "13B",
        size: "7.3 GB"
      },
      {
        name: "codellama:34b",
        description: "Most powerful code model in the CodeLlama family",
        tags: ["code", "programming"],
        parameterCount: "34B",
        size: "19 GB"
      },
      {
        name: "llama2",
        description: "Meta's previous generation general purpose LLM",
        tags: ["general"],
        parameterCount: "7B",
        size: "3.8 GB"
      },
      {
        name: "qwen:0.5b",
        description: "Efficient small language model from Alibaba",
        tags: ["small", "efficient"],
        parameterCount: "0.5B",
        size: "394 MB"
      },
      {
        name: "qwen:1.5b",
        description: "Small but capable language model from Alibaba",
        tags: ["small", "efficient"],
        parameterCount: "1.5B",
        size: "792 MB"
      },
      {
        name: "qwen:4b",
        description: "Mid-sized language model from Alibaba",
        tags: ["general"],
        parameterCount: "4B",
        size: "2.4 GB"
      },
      {
        name: "qwen:7b",
        description: "Versatile language model from Alibaba",
        tags: ["general", "recommended"],
        parameterCount: "7B",
        size: "3.9 GB"
      },
      {
        name: "qwen:14b",
        description: "Powerful general purpose language model from Alibaba",
        tags: ["powerful"],
        parameterCount: "14B",
        size: "7.8 GB"
      },
      {
        name: "phi3:3.8b",
        description: "Microsoft's newest small language model with strong reasoning",
        tags: ["latest", "small", "reasoning"],
        parameterCount: "3.8B",
        size: "2.2 GB"
      },
      {
        name: "gemma:2b",
        description: "Google's lightweight model for various tasks",
        tags: ["small"],
        parameterCount: "2B",
        size: "1.4 GB"
      },
      {
        name: "gemma:7b",
        description: "Google's versatile model for complex reasoning",
        tags: ["general"],
        parameterCount: "7B",
        size: "4.8 GB"
      },
      {
        name: "orca-mini",
        description: "Smaller model with good performance on limited hardware",
        tags: ["small", "efficient"],
        parameterCount: "3B",
        size: "1.8 GB"
      },
      {
        name: "neural-chat",
        description: "Intel's optimized chat model based on Mistral",
        tags: ["chat"],
        parameterCount: "7B",
        size: "4.1 GB"
      },
      {
        name: "vicuna",
        description: "Fine-tuned LLaMA model optimized for conversations",
        tags: ["chat"],
        parameterCount: "7B",
        size: "3.8 GB"
      }
    ];
  }
}

const modelSearchService = new ModelSearchService();
export default modelSearchService;
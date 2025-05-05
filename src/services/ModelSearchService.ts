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
        name: "qwen:0.5b",
        description: "Efficient small language model from Alibaba",
        tags: ["small", "efficient"],
        parameterCount: "0.5B",
        size: "394 MB"
      },
      {
        name: "gemma3:4b-it-qat",
        description: "Vision Model",
        tags: ["smaall", "efficient"],
        parameterCount: "4b",
        size: "4Gb"
      }
    ];
  }
}

const modelSearchService = new ModelSearchService();
export default modelSearchService;
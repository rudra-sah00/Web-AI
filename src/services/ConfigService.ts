import { AppConfig, OllamaModel, AppSettings } from './types';
import ollamaService from './OllamaService';
import defaultConfig from '../config/config.json';

class ConfigService {
  private config: AppConfig;
  private initializing: Promise<void> | null = null;
  
  constructor() {
    // Start with default config from build-time config.json
    this.config = { ...defaultConfig } as AppConfig;
    
    // Initialize config from runtime sources
    this.initializing = this.initialize();
  }
  
  /**
   * Initialize config from runtime sources (localStorage or runtime-config.json)
   */
  private async initialize(): Promise<void> {
    // Client-side: Try to load from server first, then localStorage as fallback
    if (typeof window !== 'undefined') {
      // First try to load from server API
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const serverConfig = await response.json();
          this.config = { ...this.config, ...serverConfig };
          console.log('Config loaded from server');
        }
      } catch (e) {
        console.error('Failed to load config from server:', e);
      }

      // Then try localStorage as fallback
      const savedConfig = localStorage.getItem('ollamaConfig');
      if (savedConfig) {
        try {
          const localConfig = JSON.parse(savedConfig);
          // Merge with server config, giving priority to server data
          this.config = { ...localConfig, ...this.config };
          console.log('Config merged with localStorage fallback');
        } catch (e) {
          console.error('Failed to parse saved config from localStorage:', e);
        }
      }

      // Load runtime config data
      try {
        const response = await fetch('/runtime-config.json');
        if (response.ok) {
          const runtimeConfig = await response.json();
          this.config = { ...this.config, ...runtimeConfig };
        }
      } catch (e) {
        console.error('Failed to load runtime config:', e);
      }
    }
    // Server-side initialization would happen in the API route
  }
  
  /**
   * Get the current config (awaiting initialization if needed)
   */
  async getConfigAsync(): Promise<AppConfig> {
    if (this.initializing) {
      await this.initializing;
    }
    return this.config;
  }
  
  /**
   * Get the current config (synchronous, might not be fully initialized)
   */
  getConfig(): AppConfig {
    return this.config;
  }
  
  /**
   * Get all configured Ollama models
   */
  getOllamaModels(): OllamaModel[] {
    return this.config.ollamaModels;
  }
  
  /**
   * Get app settings
   */
  getSettings(): AppSettings {
    return this.config.defaultSettings;
  }
  
  /**
   * Save config changes to localStorage and the server
   */
  private async saveConfig(): Promise<boolean> {
    try {
      // Format JSON with 2-space indentation for readability
      const configJson = JSON.stringify(this.config, null, 2);
      
      // Save to localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('ollamaConfig', configJson);
        
        // Also make a fetch request to update the server-side config
        try {
          const response = await fetch('/api/config', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: configJson,
          });
          
          if (!response.ok) {
            console.error('Failed to update server config:', await response.text());
          } else {
            console.log('Config saved to server successfully');
          }
        } catch (error) {
          console.error('Failed to sync config with server:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  }
  
  /**
   * Update app settings
   */
  async updateSettings(settings: Partial<AppSettings>): Promise<boolean> {
    this.config.defaultSettings = {
      ...this.config.defaultSettings,
      ...settings
    };
    
    // Update the API endpoint for the Ollama service
    if (settings.apiEndpoint) {
      ollamaService.setApiEndpoint(settings.apiEndpoint);
    }
    
    // Save changes
    return this.saveConfig();
  }
  
  /**
   * Update a model configuration
   */
  async updateModelConfig(modelId: string, updates: Partial<OllamaModel>): Promise<boolean> {
    const index = this.config.ollamaModels.findIndex(model => model.id === modelId);
    
    if (index === -1) {
      // Model doesn't exist, create a new one
      const newModel: OllamaModel = {
        id: modelId,
        name: modelId, // Use id as name if not specified
        description: `Model configuration for ${modelId}`,
        installed: true,
        parameters: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2048
        },
        ...updates
      };
      
      this.config.ollamaModels.push(newModel);
    } else {
      this.config.ollamaModels[index] = {
        ...this.config.ollamaModels[index],
        ...updates
      };
    }
    
    // Save changes
    return this.saveConfig();
  }
  
  /**
   * Add a new model configuration
   */
  async addModelConfig(model: OllamaModel): Promise<boolean> {
    this.config.ollamaModels.push(model);
    
    // Save changes
    return this.saveConfig();
  }
  
  /**
   * Remove a model configuration
   */
  async removeModelConfig(modelId: string): Promise<boolean> {
    const initialLength = this.config.ollamaModels.length;
    this.config.ollamaModels = this.config.ollamaModels.filter(model => model.id !== modelId);
    
    const removed = this.config.ollamaModels.length < initialLength;
    if (removed) {
      // Save changes
      await this.saveConfig();
    }
    
    return removed;
  }
  
  /**
   * Get a specific model configuration
   */
  getModelConfig(modelId: string): OllamaModel | undefined {
    return this.config.ollamaModels.find(model => model.id === modelId);
  }
  
  /**
   * Sync installed status with actual models on the system
   */
  async syncInstalledModels(): Promise<OllamaModel[]> {
    try {
      // Check if Ollama service is running
      const status = await ollamaService.checkOllamaStatus();
      if (status.status === 'error') {
        console.error(status.message);
        return this.config.ollamaModels;
      }
      
      // Get list of installed models
      const modelList = await ollamaService.listModels();
      if (!modelList) {
        return this.config.ollamaModels;
      }
      
      // Update installed status for each model
      const installedModelNames = modelList.models.map(m => m.name);
      
      this.config.ollamaModels = this.config.ollamaModels.map(model => ({
        ...model,
        installed: installedModelNames.includes(model.id)
      }));
      
      return this.config.ollamaModels;
    } catch (error) {
      console.error('Error syncing installed models:', error);
      return this.config.ollamaModels;
    }
  }
}

// Create singleton instance
const configService = new ConfigService();
export default configService;
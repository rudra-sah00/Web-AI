import React from 'react';
import { BaseSettingsService } from './BaseSettingsService';
import { ModelSettings } from './types/SettingsTypes';

// Default model settings
const DEFAULT_MODEL_SETTINGS: ModelSettings = {
  defaultTemperature: 0.7,
  defaultTopP: 0.9,
  defaultMaxTokens: 2048,
  defaultModel: '', // No default model - user must select one
  ollamaEndpoint: 'http://localhost:11434',
  ollamaApiKey: undefined,
};

// Model settings service
class ModelSettingsService extends BaseSettingsService<ModelSettings> {
  constructor() {
    super(DEFAULT_MODEL_SETTINGS, 'model');
  }

  // Get model parameters
  getModelParameters() {
    const settings = this.getSettings();
    return {
      temperature: settings.defaultTemperature,
      top_p: settings.defaultTopP,
      max_tokens: settings.defaultMaxTokens,
      model: settings.defaultModel
    };
  }

  // Get model parameters with loading guarantee
  async getModelParametersAsync() {
    const settings = await this.getSettingsAsync();
    return {
      temperature: settings.defaultTemperature,
      top_p: settings.defaultTopP,
      max_tokens: settings.defaultMaxTokens,
      model: settings.defaultModel
    };
  }

  // Update model parameters
  async updateModelParameters(params: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    model?: string;
  }): Promise<boolean> {
    const updates: Partial<ModelSettings> = {};
    
    if (params.temperature !== undefined) updates.defaultTemperature = params.temperature;
    if (params.topP !== undefined) updates.defaultTopP = params.topP;
    if (params.maxTokens !== undefined) updates.defaultMaxTokens = params.maxTokens;
    if (params.model !== undefined) updates.defaultModel = params.model;
    
    return this.updateSettings(updates);
  }

  // Update Ollama connection
  async updateOllamaConnection(endpoint: string, apiKey?: string): Promise<boolean> {
    const success = await Promise.all([
      this.updateSetting('ollamaEndpoint', endpoint),
      apiKey !== undefined ? this.updateSetting('ollamaApiKey', apiKey) : Promise.resolve(true)
    ]);
    
    return success.every(s => s);
  }

  // Get Ollama connection info
  getOllamaConnection() {
    const settings = this.getSettings();
    return {
      endpoint: settings.ollamaEndpoint,
      apiKey: settings.ollamaApiKey
    };
  }
}

// Create singleton instance
const modelSettingsService = new ModelSettingsService();

// React hook for model settings
export function useModelSettings() {
  const [settings, setSettings] = React.useState<ModelSettings>(
    modelSettingsService.getSettings()
  );

  React.useEffect(() => {
    const unsubscribe = modelSettingsService.subscribe(setSettings);
    return unsubscribe;
  }, []);

  return {
    settings,
    updateSetting: modelSettingsService.updateSetting.bind(modelSettingsService),
    updateModelParameters: modelSettingsService.updateModelParameters.bind(modelSettingsService),
    updateOllamaConnection: modelSettingsService.updateOllamaConnection.bind(modelSettingsService),
    getModelParameters: modelSettingsService.getModelParameters.bind(modelSettingsService),
    getOllamaConnection: modelSettingsService.getOllamaConnection.bind(modelSettingsService),
    updateSettings: modelSettingsService.updateSettings.bind(modelSettingsService),
    refresh: modelSettingsService.refresh.bind(modelSettingsService)
  };
}

export default modelSettingsService;

// Export additional async helpers
export const getModelAsync = async (): Promise<string> => {
  const settings = await modelSettingsService.getSettingsAsync();
  return settings.defaultModel || '';
};

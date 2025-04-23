import { ModelParameters, OllamaModel } from './types';
import configService from './ConfigService';

/**
 * Service to handle customization of model parameters
 */
class ModelParameterService {
  /**
   * Get the default parameters for a model
   */
  getDefaultParameters(modelId: string): ModelParameters | null {
    const model = configService.getModelConfig(modelId);
    return model ? model.parameters : null;
  }
  
  /**
   * Save custom parameters for a model
   */
  async saveCustomParameters(modelId: string, parameters: ModelParameters): Promise<boolean> {
    return await configService.updateModelConfig(modelId, { parameters });
  }
  
  /**
   * Reset parameters to defaults
   */
  async resetToDefaults(modelId: string): Promise<boolean> {
    // Get the original model from config.json
    const originalConfig = require('../config/config.json');
    const originalModel = originalConfig.ollamaModels.find((m: OllamaModel) => m.id === modelId);
    
    if (!originalModel) {
      return false;
    }
    
    return await configService.updateModelConfig(modelId, { 
      parameters: originalModel.parameters 
    });
  }
  
  /**
   * Validate parameters are within acceptable ranges
   */
  validateParameters(parameters: ModelParameters): { valid: boolean, errors: string[] } {
    const errors: string[] = [];
    
    if (parameters.temperature < 0 || parameters.temperature > 2) {
      errors.push('Temperature should be between 0 and 2');
    }
    
    if (parameters.top_p < 0 || parameters.top_p > 1) {
      errors.push('Top P should be between 0 and 1');
    }
    
    if (parameters.max_tokens < 1 || parameters.max_tokens > 32000) {
      errors.push('Max tokens should be between 1 and 32000');
    }
    
    if (parameters.frequency_penalty && (parameters.frequency_penalty < -2 || parameters.frequency_penalty > 2)) {
      errors.push('Frequency penalty should be between -2 and 2');
    }
    
    if (parameters.presence_penalty && (parameters.presence_penalty < -2 || parameters.presence_penalty > 2)) {
      errors.push('Presence penalty should be between -2 and 2');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Get parameter descriptions for UI display
   */
  getParameterDescriptions(): Record<keyof ModelParameters, string> {
    return {
      temperature: 'Controls randomness: lower values are more deterministic (0-2)',
      top_p: 'Controls diversity via nucleus sampling (0-1)',
      max_tokens: 'Maximum number of tokens to generate',
      frequency_penalty: 'Decrease the likelihood of repetition (optional, -2 to 2)',
      presence_penalty: 'Increase diversity of word choices (optional, -2 to 2)'
    };
  }
}

const modelParameterService = new ModelParameterService();
export default modelParameterService;
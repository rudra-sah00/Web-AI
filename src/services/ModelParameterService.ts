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
    if (model && model.parameters) {
      return model.parameters;
    }
    
    // If model not found in config, return default parameters
    return {
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 2048,
      top_k: 40,
      repeat_penalty: 1.1,
      seed: -1,
      num_ctx: 2048
    };
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
    
    let defaultParameters: ModelParameters;
    
    if (originalModel && originalModel.parameters) {
      defaultParameters = originalModel.parameters;
    } else {
      // Use generic defaults for models not in config
      defaultParameters = {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2048,
        top_k: 40,
        repeat_penalty: 1.1,
        seed: -1,
        num_ctx: 2048
      };
    }
    
    return await configService.updateModelConfig(modelId, { 
      parameters: defaultParameters 
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
    
    if (parameters.top_k && (parameters.top_k < 1 || parameters.top_k > 100)) {
      errors.push('Top K should be between 1 and 100');
    }
    
    if (parameters.repeat_penalty && (parameters.repeat_penalty < 0.1 || parameters.repeat_penalty > 2.0)) {
      errors.push('Repeat penalty should be between 0.1 and 2.0');
    }
    
    if (parameters.num_ctx && (parameters.num_ctx < 512 || parameters.num_ctx > 8192)) {
      errors.push('Context window should be between 512 and 8192');
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
      top_k: 'Limits the number of highest probability tokens to consider (1-100)',
      repeat_penalty: 'Penalty for repeating tokens (0.1-2.0, 1.0 = no penalty)',
      seed: 'Random seed for reproducible outputs (-1 for random)',
      num_ctx: 'Context window size (512-8192)',
      frequency_penalty: 'Decrease the likelihood of repetition (optional, -2 to 2)',
      presence_penalty: 'Increase diversity of word choices (optional, -2 to 2)'
    };
  }
}

const modelParameterService = new ModelParameterService();
export default modelParameterService;
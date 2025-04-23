import { useState, useCallback } from 'react';
import { AppSettings, ModelParameters } from '../types';
import configService from '../ConfigService';
import modelParameterService from '../ModelParameterService';

/**
 * Hook for working with application settings
 */
export function useOllamaSettings() {
  const [settings, setSettings] = useState<AppSettings>(configService.getSettings());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Update application settings
  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    setIsSaving(true);
    try {
      await configService.updateSettings(newSettings);
      setSettings(configService.getSettings());
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Get parameters for a specific model
  const getModelParameters = useCallback((modelId: string): ModelParameters | null => {
    return modelParameterService.getDefaultParameters(modelId);
  }, []);
  
  // Update parameters for a specific model
  const updateModelParameters = useCallback(async (modelId: string, parameters: ModelParameters): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Validate parameters before saving
      const validation = modelParameterService.validateParameters(parameters);
      setValidationErrors(validation.errors);
      
      if (!validation.valid) {
        return false;
      }
      
      // Save parameters
      const success = await modelParameterService.saveCustomParameters(modelId, parameters);
      return success;
    } catch (error) {
      console.error('Failed to update model parameters:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  // Reset model parameters to defaults
  const resetModelParameters = useCallback(async (modelId: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      const success = await modelParameterService.resetToDefaults(modelId);
      return success;
    } catch (error) {
      console.error('Failed to reset model parameters:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  // Get descriptions for all parameters
  const getParameterDescriptions = useCallback(() => {
    return modelParameterService.getParameterDescriptions();
  }, []);
  
  return {
    settings,
    validationErrors,
    isSaving,
    updateSettings,
    getModelParameters,
    updateModelParameters,
    resetModelParameters,
    getParameterDescriptions
  };
}
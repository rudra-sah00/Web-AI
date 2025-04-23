import { useState, useEffect, useCallback } from 'react';
import { OllamaModel } from '../types';
import configService from '../ConfigService';
import ollamaService from '../OllamaService';

/**
 * Hook for working with Ollama models
 */
export function useOllamaModels() {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  // Fetch models from configuration and check which ones are installed
  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Check connection to Ollama service
      const status = await ollamaService.checkOllamaStatus();
      setConnectionStatus(status.status === 'success' ? 'connected' : 'disconnected');
      
      if (status.status === 'error') {
        setError(status.message);
        setModels(configService.getOllamaModels());
        return;
      }
      
      // Sync with installed models
      const updatedModels = await configService.syncInstalledModels();
      setModels(updatedModels);
    } catch (err) {
      setConnectionStatus('disconnected');
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
      setModels(configService.getOllamaModels());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Pull a model from the Ollama registry
  const pullModel = useCallback(async (modelId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const model = configService.getModelConfig(modelId);
      if (!model) {
        throw new Error(`Model ${modelId} not found`);
      }
      
      const response = await ollamaService.pullModel({
        name: modelId,
        stream: false
      });
      
      if (response.ok) {
        // Update the installed status
        configService.updateModelConfig(modelId, { installed: true });
        // Reload models
        await fetchModels();
        return true;
      } else {
        const errorText = await response.text();
        setError(`Error pulling model: ${errorText}`);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pull model');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchModels]);

  // Delete an installed model
  const deleteModel = useCallback(async (modelId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ollamaService.deleteModel(modelId);
      
      if (response.status === 'success') {
        // Update the installed status
        configService.updateModelConfig(modelId, { installed: false });
        // Reload models
        await fetchModels();
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete model');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchModels]);

  // Initial load
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return {
    models,
    isLoading,
    error,
    connectionStatus,
    fetchModels,
    pullModel,
    deleteModel,
  };
}
import { useState, useEffect, useCallback } from 'react';
import modelSearchService, { OllamaLibraryModel } from '../ModelSearchService';
import configService from '../ConfigService';
import ollamaService from '../OllamaService';
import { OllamaModel } from '../types';

interface InstallStatus {
  modelId: string;
  progress: number;
  status: 'preparing' | 'downloading' | 'installing' | 'complete' | 'error';
  message?: string;
}

export function useModelSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OllamaLibraryModel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [installStatuses, setInstallStatuses] = useState<Map<string, InstallStatus>>(new Map());
  
  // Get models that match search query
  const performSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const results = await modelSearchService.searchModels(query);
      setSearchResults(results);
    } catch (error) {
      setSearchError('Failed to search for models');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  // Update search query and trigger search
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    performSearch(query);
  }, [performSearch]);
  
  // Handle progress updates for model installation
  const handleProgressUpdate = useCallback((modelId: string, progress: number, status: string) => {
    setInstallStatuses(prev => {
      const newMap = new Map(prev);
      const currentStatus = prev.get(modelId) || { 
        modelId, 
        progress: 0, 
        status: 'preparing'
      };
      
      newMap.set(modelId, {
        ...currentStatus,
        progress,
        status: status === 'downloading' ? 'downloading' : 
               progress === 100 ? 'installing' : currentStatus.status
      });
      
      return newMap;
    });
  }, []);
  
  // Add a model to config and optionally install it
  const addModelToConfig = useCallback(async (libraryModel: OllamaLibraryModel, installModel: boolean = false): Promise<boolean> => {
    try {
      // Create new model config entry
      const modelId = libraryModel.name;
      const newModel: OllamaModel = {
        id: modelId,
        name: `${libraryModel.name}${libraryModel.parameterCount ? ` (${libraryModel.parameterCount})` : ''}`,
        description: libraryModel.description,
        parameters: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2048
        },
        installed: false
      };
      
      // Add to configuration
      configService.addModelConfig(newModel);
      
      // Install if requested
      if (installModel) {
        const status = await ollamaService.checkOllamaStatus();
        if (status.status === 'error') {
          throw new Error('Ollama service is not running');
        }
        
        // Set initial install status
        setInstallStatuses(prev => {
          const newMap = new Map(prev);
          newMap.set(modelId, {
            modelId,
            progress: 0,
            status: 'preparing'
          });
          return newMap;
        });
        
        // Register progress callback
        ollamaService.registerProgressCallback(modelId, 
          (progress, status) => handleProgressUpdate(modelId, progress, status)
        );
        
        const response = await ollamaService.pullModel({
          name: modelId,
          stream: true
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          setInstallStatuses(prev => {
            const newMap = new Map(prev);
            newMap.set(modelId, {
              modelId,
              progress: 0,
              status: 'error',
              message: errorText
            });
            return newMap;
          });
          throw new Error(`Failed to install model: ${errorText}`);
        }
        
        // Installation completed successfully
        setInstallStatuses(prev => {
          const newMap = new Map(prev);
          newMap.set(modelId, {
            modelId,
            progress: 100,
            status: 'complete'
          });
          return newMap;
        });
        
        // Update model as installed
        configService.updateModelConfig(modelId, { installed: true });
        
        // Clean up callback after a delay
        setTimeout(() => {
          ollamaService.unregisterProgressCallback(modelId);
        }, 2000);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding model:', error);
      return false;
    }
  }, [handleProgressUpdate]);

  // Get installation status for a specific model
  const getInstallStatus = useCallback((modelId: string): InstallStatus | undefined => {
    return installStatuses.get(modelId);
  }, [installStatuses]);

  // Cancel model installation
  const cancelInstallation = useCallback((modelId: string): void => {
    // Note: Ollama API doesn't currently support cancelling installations
    // This just updates UI state - the download will continue server-side
    ollamaService.unregisterProgressCallback(modelId);
    
    setInstallStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(modelId, {
        modelId,
        progress: 0,
        status: 'error',
        message: 'Installation cancelled'
      });
      return newMap;
    });
  }, []);

  // Initial search for popular models
  useEffect(() => {
    performSearch('');
  }, [performSearch]);
  
  return {
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    installStatuses,
    updateSearchQuery,
    performSearch,
    addModelToConfig,
    getInstallStatus,
    cancelInstallation
  };
}
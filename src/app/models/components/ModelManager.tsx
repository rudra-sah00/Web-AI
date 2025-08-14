"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Trash2, 
  Copy, 
  Info, 
  HardDrive, 
  Calendar, 
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  Package
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import OllamaService from '@/services/OllamaService';
import { ModelListResponse } from '@/services/types';
import { ModelParameterDialog } from '@/components/ModelParameterDialog';

interface InstalledModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

export function ModelManager() {
  const [installedModels, setInstalledModels] = useState<InstalledModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationInProgress, setOperationInProgress] = useState<Record<string, string>>({});
  const [selectedModel, setSelectedModel] = useState<InstalledModel | null>(null);
  
  // Model parameter dialog state
  const [selectedModelForParams, setSelectedModelForParams] = useState<string | null>(null);
  const [isParameterDialogOpen, setIsParameterDialogOpen] = useState(false);

  useEffect(() => {
    loadInstalledModels();
  }, []);

  const loadInstalledModels = async () => {
    try {
      setLoading(true);
      const response = await OllamaService.listModels();
      if (response?.models) {
        setInstalledModels(response.models);
      }
    } catch (error) {
      console.error('Error loading installed models:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteModel = async (modelName: string) => {
    try {
      setOperationInProgress(prev => ({ ...prev, [modelName]: 'deleting' }));
      
      const result = await OllamaService.deleteModel(modelName);
      
      if (result.status === 'success') {
        setInstalledModels(prev => prev.filter(model => model.name !== modelName));
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      alert(`Failed to delete model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setOperationInProgress(prev => {
        const newState = { ...prev };
        delete newState[modelName];
        return newState;
      });
    }
  };

  const copyModel = async (sourceName: string, destinationName: string) => {
    try {
      setOperationInProgress(prev => ({ ...prev, [sourceName]: 'copying' }));
      
      const result = await OllamaService.copyModel(sourceName, destinationName);
      
      if (result.status === 'success') {
        await loadInstalledModels(); // Refresh the list
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error copying model:', error);
      alert(`Failed to copy model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setOperationInProgress(prev => {
        const newState = { ...prev };
        delete newState[sourceName];
        return newState;
      });
    }
  };

  const getModelInfo = async (modelName: string) => {
    try {
      const info = await OllamaService.getModelInfo(modelName);
      const model = installedModels.find(m => m.name === modelName);
      if (model) {
        setSelectedModel({ ...model, details: info });
      }
    } catch (error) {
      console.error('Error getting model info:', error);
    }
  };

  const formatSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleCopyModel = (sourceName: string) => {
    const destinationName = prompt(`Enter new name for copy of "${sourceName}":`);
    if (destinationName && destinationName.trim()) {
      copyModel(sourceName, destinationName.trim());
    }
  };

  const handleDeleteModel = (modelName: string) => {
    if (confirm(`Are you sure you want to delete "${modelName}"? This action cannot be undone.`)) {
      deleteModel(modelName);
    }
  };

  const handleOpenParameterDialog = (modelName: string) => {
    setSelectedModelForParams(modelName);
    setIsParameterDialogOpen(true);
  };

  const handleCloseParameterDialog = () => {
    setSelectedModelForParams(null);
    setIsParameterDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading installed models...</span>
      </div>
    );
  }

  if (installedModels.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <Package className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No models installed</h3>
            <p className="text-muted-foreground">
              Install some models from the browser above to get started.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <span className="font-medium">{installedModels.length} models installed</span>
        </div>
        <Button onClick={loadInstalledModels} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {installedModels.map((model) => {
          const isOperating = operationInProgress[model.name];
          
          return (
            <Card key={model.name} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {model.name}
                      {isOperating && (
                        <Badge variant="secondary" className="text-xs">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          {isOperating}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Digest: {model.digest.substring(0, 16)}...
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenParameterDialog(model.name)}
                      title="Configure model parameters"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => getModelInfo(model.name)}
                          title="View model information"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Model Information</DialogTitle>
                          <DialogDescription>
                            Detailed information about {selectedModel?.name}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedModel && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Name</label>
                                <p className="text-sm text-muted-foreground">{selectedModel.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Family</label>
                                <p className="text-sm text-muted-foreground">{selectedModel.details?.family || 'Unknown'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Size</label>
                                <p className="text-sm text-muted-foreground">{formatSize(selectedModel.size)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Modified</label>
                                <p className="text-sm text-muted-foreground">{formatDate(selectedModel.modified_at)}</p>
                              </div>
                            </div>
                            
                            {selectedModel.details && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <h4 className="font-medium">Details</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    {selectedModel.details.family && (
                                      <div>
                                        <label className="font-medium">Family</label>
                                        <p className="text-muted-foreground">{selectedModel.details.family}</p>
                                      </div>
                                    )}
                                    {selectedModel.details.parameter_size && (
                                      <div>
                                        <label className="font-medium">Parameters</label>
                                        <p className="text-muted-foreground">{selectedModel.details.parameter_size}</p>
                                      </div>
                                    )}
                                    {selectedModel.details.format && (
                                      <div>
                                        <label className="font-medium">Format</label>
                                        <p className="text-muted-foreground">{selectedModel.details.format}</p>
                                      </div>
                                    )}
                                    {selectedModel.details.quantization_level && (
                                      <div>
                                        <label className="font-medium">Quantization</label>
                                        <p className="text-muted-foreground">{selectedModel.details.quantization_level}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                            
                            <Separator />
                            <div>
                              <label className="text-sm font-medium">Digest</label>
                              <p className="text-xs text-muted-foreground font-mono break-all">{selectedModel.digest}</p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyModel(model.name)}
                      disabled={!!isOperating}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteModel(model.name)}
                      disabled={!!isOperating}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span>{formatSize(model.size)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(model.modified_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{model.details?.format || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Ready</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Model Parameter Dialog */}
      <ModelParameterDialog
        modelId={selectedModelForParams}
        isOpen={isParameterDialogOpen}
        onClose={handleCloseParameterDialog}
      />
    </div>
  );
}

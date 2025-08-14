"use client";

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OllamaModel } from '@/services/types';
import { 
  Package, 
  Trash2, 
  Copy, 
  Upload, 
  Download, 
  Info, 
  Calendar, 
  HardDrive, 
  Loader2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Settings
} from 'lucide-react';
import ollamaService from '@/services/OllamaService';
import { ModelListResponse } from '@/services/types';
import { ModelParameterDialog } from '@/components/ModelParameterDialog';

interface ModelInfo {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export function ModelManagementSettings() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [copyModelName, setCopyModelName] = useState('');
  
  // Model parameter dialog state
  const [selectedModelForParams, setSelectedModelForParams] = useState<string | null>(null);
  const [isParameterDialogOpen, setIsParameterDialogOpen] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      const response = await ollamaService.listModels();
      if (response) {
        setModels(response.models || []);
      }
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModel = async (modelName: string) => {
    if (!confirm(`Are you sure you want to delete the model "${modelName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await ollamaService.deleteModel(modelName);
      if (result.status === 'success') {
        setModels(prev => prev.filter(model => model.name !== modelName));
        setSelectedModels(prev => {
          const newSet = new Set(prev);
          newSet.delete(modelName);
          return newSet;
        });
      } else {
        alert(`Error deleting model: ${result.message}`);
      }
    } catch (error) {
      alert('Error deleting model. Please try again.');
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

  const handleCopyModel = async (sourceModel: string) => {
    if (!copyModelName.trim()) {
      alert('Please enter a name for the copied model');
      return;
    }

    try {
      const result = await ollamaService.copyModel(sourceModel, copyModelName);
      if (result.status === 'success') {
        setCopyModelName('');
        loadModels(); // Refresh the list
      } else {
        alert(`Error copying model: ${result.message}`);
      }
    } catch (error) {
      alert('Error copying model. Please try again.');
    }
  };

  const formatSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const toggleModelSelection = (modelName: string) => {
    setSelectedModels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelName)) {
        newSet.delete(modelName);
      } else {
        newSet.add(modelName);
      }
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedModels.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedModels.size} selected model(s)? This action cannot be undone.`)) {
      return;
    }

    for (const modelName of selectedModels) {
      try {
        await ollamaService.deleteModel(modelName);
      } catch (error) {
        console.error(`Error deleting model ${modelName}:`, error);
      }
    }

    setSelectedModels(new Set());
    loadModels();
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Installed Models</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your locally installed Ollama models
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadModels} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {selectedModels.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedModels.size})
            </Button>
          )}
        </div>
      </div>

      {/* Models List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading models...</span>
        </div>
      ) : models.length === 0 ? (
        <div className="text-center py-8">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No models installed</h3>
          <p className="text-muted-foreground">
            Install models from the Model Browser to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {models.map((model) => (
            <Card key={model.name} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedModels.has(model.name)}
                      onChange={() => toggleModelSelection(model.name)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {model.name}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-4 w-4" />
                          {formatSize(model.size)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(model.modified_at)}
                        </div>
                      </div>
                    </div>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newName = prompt('Enter name for the copied model:', `${model.name}-copy`);
                        if (newName) {
                          setCopyModelName(newName);
                          handleCopyModel(model.name);
                        }
                      }}
                      title="Copy model"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteModel(model.name)}
                      title="Delete model"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">
                    {model.details.family}
                  </Badge>
                  <Badge variant="outline">
                    {model.details.parameter_size}
                  </Badge>
                  <Badge variant="outline">
                    {model.details.quantization_level}
                  </Badge>
                  <Badge variant="outline">
                    {model.details.format}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>Digest: {model.digest.substring(0, 16)}...</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Model Parameter Dialog */}
      <ModelParameterDialog
        modelId={selectedModelForParams}
        isOpen={isParameterDialogOpen}
        onClose={handleCloseParameterDialog}
      />
    </div>
  );
}

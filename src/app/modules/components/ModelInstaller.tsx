"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Search, 
  Filter, 
  Star, 
  Zap, 
  Brain, 
  Code, 
  Image, 
  MessageSquare,
  Clock,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import ModelSearchService from '@/services/ModelSearchService';
import OllamaService from '@/services/OllamaService';

interface ModelInstallationProgress {
  modelName: string;
  status: 'downloading' | 'completed' | 'error';
  progress: number;
  message: string;
}

export function ModelInstaller() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [filteredModels, setFilteredModels] = useState<any[]>([]);
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [installationProgress, setInstallationProgress] = useState<Record<string, ModelInstallationProgress>>({});
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Models', icon: Star },
    { id: 'general', name: 'General', icon: MessageSquare },
    { id: 'code', name: 'Code', icon: Code },
    { id: 'math', name: 'Math & Logic', icon: Brain },
    { id: 'multimodal', name: 'Multimodal', icon: Image },
    { id: 'embedding', name: 'Embeddings', icon: Zap },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterModels();
  }, [searchQuery, selectedCategory, availableModels]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load available models from service
      const models = await ModelSearchService.fetchAllModels();
      setAvailableModels(models);
      
      // Load installed models
      const installed = await OllamaService.listModels();
      if (installed?.models) {
        setInstalledModels(installed.models.map((m: any) => m.name));
      }
      
    } catch (error) {
      console.error('Error loading model data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterModels = () => {
    let filtered = [...availableModels];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(model => model.category === selectedCategory);
    }

    setFilteredModels(filtered);
  };

  const installModel = async (modelName: string) => {
    try {
      // Initialize progress tracking
      setInstallationProgress(prev => ({
        ...prev,
        [modelName]: {
          modelName,
          status: 'downloading',
          progress: 0,
          message: 'Starting download...'
        }
      }));

      // Register progress callback
      OllamaService.registerProgressCallback(modelName, (progress: number, status: string) => {
        setInstallationProgress(prev => ({
          ...prev,
          [modelName]: {
            modelName,
            status: 'downloading',
            progress: Math.round(progress) || 0,
            message: status || 'Downloading...'
          }
        }));
      });

      // Start model installation
      const response = await OllamaService.pullModel({ name: modelName, stream: true });
      
      if (!response.ok) {
        throw new Error(`Failed to install model: ${response.statusText}`);
      }

      // Mark as completed
      setInstallationProgress(prev => ({
        ...prev,
        [modelName]: {
          modelName,
          status: 'completed',
          progress: 100,
          message: 'Installation completed successfully!'
        }
      }));

      // Update installed models list
      setInstalledModels(prev => [...prev, modelName]);

      // Clean up progress callback
      OllamaService.unregisterProgressCallback(modelName);

      // Clear progress after 3 seconds
      setTimeout(() => {
        setInstallationProgress(prev => {
          const newState = { ...prev };
          delete newState[modelName];
          return newState;
        });
        OllamaService.clearInstallProgress(modelName);
      }, 3000);

    } catch (error) {
      console.error('Error installing model:', error);
      setInstallationProgress(prev => ({
        ...prev,
        [modelName]: {
          modelName,
          status: 'error',
          progress: 0,
          message: `Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }));
      
      // Clean up progress callback
      OllamaService.unregisterProgressCallback(modelName);
    }
  };

  const getSizeDisplay = (size: string) => {
    if (!size) return 'Unknown';
    return size.includes('B') ? size : `${size}B`;
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : Star;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading models...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search models by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="px-3 py-1">
              {filteredModels.length} models
            </Badge>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="h-8"
              >
                <Icon className="h-3 w-3 mr-1" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Installation Progress */}
      {Object.values(installationProgress).length > 0 && (
        <div className="space-y-2">
          {Object.values(installationProgress).map((progress) => (
            <Alert key={progress.modelName} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {progress.status === 'downloading' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {progress.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {progress.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  <span className="font-medium">{progress.modelName}</span>
                </div>
                <span className="text-sm text-muted-foreground">{progress.progress}%</span>
              </div>
              <Progress value={progress.progress} className="mb-2" />
              <p className="text-sm text-muted-foreground">{progress.message}</p>
            </Alert>
          ))}
        </div>
      )}

      {/* Models Grid */}
      <div className="grid gap-4">
        {filteredModels.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Search className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No models found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or browse different categories.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          filteredModels.map((model) => {
            const isInstalled = installedModels.includes(model.name);
            const isInstalling = installationProgress[model.name]?.status === 'downloading';
            const CategoryIcon = getCategoryIcon(model.category);

            return (
              <Card key={model.name} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        {isInstalled && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Installed
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {model.description}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => installModel(model.name)}
                      disabled={isInstalled || isInstalling}
                      size="sm"
                      className="ml-4"
                    >
                      {isInstalling ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Installing...
                        </>
                      ) : isInstalled ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Installed
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Install
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {model.tags?.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span>{getSizeDisplay(model.size)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      <span>{model.parameters || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{model.updated || 'Recently'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>{model.pulls || '0'} pulls</span>
                    </div>
                  </div>
                  
                  {model.capabilities && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Capabilities:</p>
                      <div className="flex flex-wrap gap-1">
                        {model.capabilities.map((capability: string) => (
                          <Badge key={capability} variant="secondary" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

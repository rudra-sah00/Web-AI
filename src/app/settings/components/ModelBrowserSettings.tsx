"use client";

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Download, Loader2, Package, HardDrive, User, Calendar, Info } from 'lucide-react';
import modelSearchService, { OllamaLibraryModel } from '@/services/ModelSearchService';
import ollamaService from '@/services/OllamaService';

export function ModelBrowserSettings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OllamaLibraryModel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [installingModels, setInstallingModels] = useState<Set<string>>(new Set());
  const [installProgress, setInstallProgress] = useState<Record<string, number>>({});
  const [filteredResults, setFilteredResults] = useState<OllamaLibraryModel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Models' },
    { value: 'llama', label: 'Llama Models' },
    { value: 'code', label: 'Code Models' },
    { value: 'multimodal', label: 'Multimodal' },
    { value: 'embedding', label: 'Embeddings' },
    { value: 'small', label: 'Small Models' },
    { value: 'efficient', label: 'Efficient' }
  ];

  useEffect(() => {
    loadPopularModels();
  }, []);

  useEffect(() => {
    filterResults();
  }, [searchResults, selectedCategory]);

  const loadPopularModels = async () => {
    setIsSearching(true);
    try {
      const models = await modelSearchService.fetchAllModels();
      setSearchResults(models);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPopularModels();
      return;
    }

    setIsSearching(true);
    try {
      const results = await modelSearchService.searchModels(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching models:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const filterResults = () => {
    if (selectedCategory === 'all') {
      setFilteredResults(searchResults);
      return;
    }

    const filtered = searchResults.filter(model => 
      model.tags?.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      model.name.toLowerCase().includes(selectedCategory.toLowerCase())
    );
    setFilteredResults(filtered);
  };

  const handleInstallModel = async (model: OllamaLibraryModel) => {
    const modelId = modelSearchService.getStandardModelId(model.name);
    
    setInstallingModels(prev => new Set([...prev, modelId]));
    setInstallProgress(prev => ({ ...prev, [modelId]: 0 }));

    // Register progress callback
    ollamaService.registerProgressCallback(modelId, (progress, status) => {
      setInstallProgress(prev => ({ ...prev, [modelId]: progress }));
    });

    try {
      await ollamaService.pullModel({ name: model.name, stream: true });
      
      // Installation completed
      setInstallingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
      
      setInstallProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[modelId];
        return newProgress;
      });

      ollamaService.clearInstallProgress(modelId);
    } catch (error) {
      console.error('Error installing model:', error);
      setInstallingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
    }
  };

  const getModelSizeColor = (size: string) => {
    const sizeNum = parseFloat(size);
    if (size.includes('MB') || sizeNum < 1) return 'bg-green-100 text-green-800';
    if (sizeNum < 5) return 'bg-blue-100 text-blue-800';
    if (sizeNum < 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search models by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Model Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Available Models</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredResults.length} models found
            </p>
          </div>
        </div>

        {isSearching ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Searching models...</span>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredResults.map((model) => {
              const modelId = modelSearchService.getStandardModelId(model.name);
              const isInstalling = installingModels.has(modelId);
              const progress = installProgress[modelId] || 0;

              return (
                <Card key={model.name} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          {model.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {model.description}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => handleInstallModel(model)}
                        disabled={isInstalling}
                        size="sm"
                        className="ml-4"
                      >
                        {isInstalling ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {progress}%
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
                  
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {model.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {model.parameterCount && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {model.parameterCount} parameters
                        </div>
                      )}
                      {model.size && (
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-4 w-4" />
                          <Badge variant="outline" className={getModelSizeColor(model.size)}>
                            {model.size}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Progress bar for installing models */}
                    {isInstalling && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Installing... {progress}% complete
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {!isSearching && filteredResults.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No models found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or category filter
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

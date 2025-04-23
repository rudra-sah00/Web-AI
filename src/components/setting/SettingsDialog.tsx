"use client";

import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Trash2, 
  Download, 
  RefreshCw, 
  AlertCircle,
  Server,
  Settings as SettingsIcon,
  Search,
  Tag,
  Info,
  Loader2
} from "lucide-react";

import { useOllamaModels } from "@/services/hooks/useOllamaModels";
import { useOllamaSettings } from "@/services/hooks/useOllamaSettings";
import { useModelSearch } from "@/services/hooks/useModelSearch";
import { ModelParameters } from "@/services/types";
import { OllamaLibraryModel } from "@/services/ModelSearchService";

export const SettingsDialog: React.FC = () => {
  // Get models and status from hooks
  const { 
    models, 
    isLoading, 
    error, 
    connectionStatus, 
    fetchModels, 
    pullModel, 
    deleteModel 
  } = useOllamaModels();
  
  const {
    settings,
    validationErrors,
    isSaving,
    updateSettings,
    getModelParameters,
    updateModelParameters,
    resetModelParameters,
    getParameterDescriptions
  } = useOllamaSettings();

  const {
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    installStatuses,
    updateSearchQuery,
    addModelToConfig,
    getInstallStatus,
    cancelInstallation
  } = useModelSearch();
  
  // Local state
  const [apiEndpoint, setApiEndpoint] = useState(settings.apiEndpoint);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [modelParams, setModelParams] = useState<ModelParameters | null>(null);
  const [isPulling, setPulling] = useState(false);
  const [showModelExplorer, setShowModelExplorer] = useState(false);
  const [installMessage, setInstallMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Handle API endpoint update
  const handleApiEndpointUpdate = async () => {
    await updateSettings({ apiEndpoint });
    
    // Refresh models with new API endpoint
    fetchModels();
  };
  
  // Handle model selection for parameter editing
  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
    const params = getModelParameters(modelId);
    setModelParams(params);
  };
  
  // Handle model parameter updates
  const handleParameterChange = (param: keyof ModelParameters, value: number) => {
    if (!modelParams || !selectedModelId) return;
    
    const newParams = {
      ...modelParams,
      [param]: value
    };
    
    setModelParams(newParams);
  };
  
  // Save model parameters
  const handleSaveParameters = async () => {
    if (!modelParams || !selectedModelId) return;
    
    const success = await updateModelParameters(selectedModelId, modelParams);
    if (success) {
      // Show success message or toast notification
      console.log("Parameters saved successfully");
    }
  };
  
  // Reset model parameters to defaults
  const handleResetParameters = async () => {
    if (!selectedModelId) return;
    
    const success = await resetModelParameters(selectedModelId);
    if (success) {
      // Update local state
      const params = getModelParameters(selectedModelId);
      setModelParams(params);
      console.log("Parameters reset successfully");
    }
  };
  
  // Handle model pull
  const handlePullModel = async (modelId: string) => {
    setPulling(true);
    await pullModel(modelId);
    setPulling(false);
  };

  // Install model from search results
  const handleInstallSearchedModel = async (model: OllamaLibraryModel) => {
    setInstallMessage(null);
    try {
      // Add model to config and install
      await addModelToConfig(model, true);
      
      // Wait for installation to complete or fail before refreshing
      // Progress is tracked by installStatuses
      const checkInstallationStatus = () => {
        const status = getInstallStatus(model.name);
        if (status?.status === 'complete') {
          fetchModels();
          setInstallMessage({
            type: 'success',
            message: `Successfully installed ${model.name}.`
          });
        } else if (status?.status === 'error') {
          setInstallMessage({
            type: 'error',
            message: status.message || `Failed to install ${model.name}`
          });
        }
      };
      
      // Set up an interval to periodically check installation status
      const statusInterval = setInterval(checkInstallationStatus, 1000);
      
      // Clear interval after a reasonable timeout
      setTimeout(() => {
        clearInterval(statusInterval);
        // If we haven't already set a message, refresh models anyway
        if (!installMessage) {
          fetchModels();
        }
      }, 60000); // 1 minute max wait
    } catch (error) {
      setInstallMessage({
        type: 'error',
        message: `Failed to install ${model.name}: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };
  
  // Get parameter descriptions for UI
  const paramDescriptions = getParameterDescriptions();

  // Check if model is already in config
  const isModelInConfig = (modelName: string): boolean => {
    return models.some(m => m.id === modelName);
  };
  
  // Helper function to render installation progress
  const renderInstallProgress = (modelId: string) => {
    const status = getInstallStatus(modelId);
    
    if (!status) return null;
    
    let statusText = "";
    switch (status.status) {
      case 'preparing':
        statusText = "Preparing...";
        break;
      case 'downloading':
        statusText = `Downloading: ${status.progress}%`;
        break;
      case 'installing':
        statusText = "Installing...";
        break;
      case 'complete':
        statusText = "Complete!";
        break;
      case 'error':
        statusText = `Error: ${status.message || 'Failed to install'}`;
        break;
    }
    
    return (
      <div className="w-full mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span>{statusText}</span>
          {(status.status === 'downloading' || status.status === 'preparing') && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 p-0 text-xs text-destructive"
              onClick={() => cancelInstallation(modelId)}
            >
              Cancel
            </Button>
          )}
        </div>
        <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              status.status === 'error' ? 'bg-destructive' : 'bg-primary'
            }`}
            style={{ width: `${status.progress}%` }}
          />
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col space-y-6 max-h-[80vh] overflow-y-auto">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      {/* Ollama Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Ollama Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span>
              {connectionStatus === 'connected' ? 'Connected to Ollama' : 
               connectionStatus === 'checking' ? 'Checking connection...' : 'Disconnected'}
            </span>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="apiEndpoint">API Endpoint</Label>
            <div className="flex gap-2">
              <Input 
                id="apiEndpoint" 
                value={apiEndpoint} 
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder="http://localhost:11434"
                className="flex-1"
              />
              <Button onClick={handleApiEndpointUpdate} disabled={isLoading}>
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Default: http://localhost:11434
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchModels}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Connection
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${models.filter(m => m.installed).length} models installed`}
          </div>
        </CardFooter>
      </Card>
      
      {/* Search & Browse Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Browse Ollama Models
          </CardTitle>
          <CardDescription>
            Search and install models from Ollama's model library
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectionStatus === 'disconnected' ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Required</AlertTitle>
              <AlertDescription>
                Connect to the Ollama service to search and install models
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Search bar */}
              <div className="flex gap-2">
                <Input
                  placeholder="Search models (e.g., 'llama', 'small', 'code')"
                  value={searchQuery}
                  onChange={(e) => updateSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant={showModelExplorer ? "default" : "outline"}
                  onClick={() => setShowModelExplorer(!showModelExplorer)}
                >
                  {showModelExplorer ? "Hide Explorer" : "Browse Models"}
                </Button>
              </div>

              {/* Status messages */}
              {installMessage && (
                <Alert variant={installMessage.type === 'success' ? "default" : "destructive"}>
                  {installMessage.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>{installMessage.type === 'success' ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>{installMessage.message}</AlertDescription>
                </Alert>
              )}

              {/* Model Explorer */}
              {showModelExplorer && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Available Models</h3>
                  
                  {isSearching ? (
                    <div className="flex justify-center p-10">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center p-6 text-muted-foreground">
                      No models found. Try a different search term.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {searchResults.map((model) => (
                        <Card key={model.name} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between">
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {model.name} 
                                  {model.parameterCount && (
                                    <span className="text-xs bg-secondary rounded-full px-2 py-0.5">
                                      {model.parameterCount}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{model.description}</p>
                                
                                {/* Tags and size */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {model.tags?.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  
                                  {model.size && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Info className="h-3 w-3" />
                                      {model.size}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Render installation progress if applicable */}
                                {renderInstallProgress(model.name)}
                              </div>
                              
                              <div>
                                {isModelInConfig(model.name) ? (
                                  <Button variant="ghost" disabled={true} className="h-8 text-xs">
                                    <Check className="h-3 w-3 mr-1" />
                                    Added
                                  </Button>
                                ) : (
                                  <Button 
                                    onClick={() => handleInstallSearchedModel(model)}
                                    disabled={!!getInstallStatus(model.name)}
                                    size="sm"
                                    className="gap-2"
                                  >
                                    {getInstallStatus(model.name) ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Download className="h-3 w-3" />
                                    )}
                                    Install
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Model Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Model Management
          </CardTitle>
          <CardDescription>
            Install, remove, and configure Ollama models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectionStatus === 'disconnected' ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Required</AlertTitle>
              <AlertDescription>
                Connect to the Ollama service to manage models
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Model List */}
              <div className="grid gap-3">
                {models.map(model => (
                  <Card key={model.id} className={`${
                    selectedModelId === model.id ? 'border-primary' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{model.name}</h3>
                          <p className="text-sm text-muted-foreground">{model.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {model.installed ? (
                            <>
                              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <Check className="h-3 w-3" />
                                Installed
                              </span>
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => deleteModel(model.id)}
                                title="Remove model"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm" 
                              onClick={() => handlePullModel(model.id)}
                              disabled={isPulling}
                              className="gap-1"
                            >
                              {isPulling ? 
                                <RefreshCw className="h-3 w-3 animate-spin" /> : 
                                <Download className="h-3 w-3" />
                              }
                              Install
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleModelSelect(model.id)}
                          >
                            Configure
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Model Parameters Editor */}
              {selectedModelId && modelParams && (
                <div className="mt-6 space-y-4">
                  <Separator />
                  <h3 className="text-lg font-medium">
                    Model Parameters: {models.find(m => m.id === selectedModelId)?.name}
                  </h3>
                  
                  {validationErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Invalid Parameters</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-4">
                          {validationErrors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-6">
                    {/* Temperature */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="temperature">Temperature: {modelParams.temperature}</Label>
                      </div>
                      <Slider 
                        id="temperature" 
                        min={0} 
                        max={2} 
                        step={0.1} 
                        value={[modelParams.temperature]} 
                        onValueChange={(values) => handleParameterChange('temperature', values[0])}
                      />
                      <p className="text-xs text-muted-foreground">{paramDescriptions.temperature}</p>
                    </div>
                    
                    {/* Top P */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="top_p">Top P: {modelParams.top_p}</Label>
                      </div>
                      <Slider 
                        id="top_p" 
                        min={0} 
                        max={1} 
                        step={0.05} 
                        value={[modelParams.top_p]} 
                        onValueChange={(values) => handleParameterChange('top_p', values[0])}
                      />
                      <p className="text-xs text-muted-foreground">{paramDescriptions.top_p}</p>
                    </div>
                    
                    {/* Max Tokens */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="max_tokens">Max Tokens: {modelParams.max_tokens}</Label>
                      </div>
                      <Slider 
                        id="max_tokens" 
                        min={10} 
                        max={8192} 
                        step={10} 
                        value={[modelParams.max_tokens]} 
                        onValueChange={(values) => handleParameterChange('max_tokens', values[0])}
                      />
                      <p className="text-xs text-muted-foreground">{paramDescriptions.max_tokens}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleResetParameters}
                      disabled={isSaving}
                    >
                      Reset to Defaults
                    </Button>
                    <Button 
                      onClick={handleSaveParameters}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : 'Save Parameters'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Application Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Application Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Default Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="defaultModel">Default Chat Model</Label>
              <div className="relative">
                <select
                  id="defaultModel"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={settings.defaultModel || ""}
                  onChange={(e) => updateSettings({
                    defaultModel: e.target.value
                  })}
                  disabled={connectionStatus !== 'connected' || models.filter(m => m.installed).length === 0}
                >
                  {models.filter(m => m.installed).length === 0 ? (
                    <option value="" disabled>No models installed</option>
                  ) : (
                    <>
                      <option value="">Select default model</option>
                      {models
                        .filter(m => m.installed)
                        .map(model => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))
                      }
                    </>
                  )}
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                Select which model will be used by default in chat conversations
                {connectionStatus !== 'connected' && " (Connect to Ollama to select a model)"}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="streamResponses">Stream Responses</Label>
                <p className="text-xs text-muted-foreground">Show model responses as they're generated</p>
              </div>
              <Switch 
                id="streamResponses" 
                checked={settings.chatSettings.streamResponses}
                onCheckedChange={(checked) => updateSettings({
                  chatSettings: {
                    ...settings.chatSettings,
                    streamResponses: checked
                  }
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="saveHistory">Save Chat History</Label>
                <p className="text-xs text-muted-foreground">Persist chat conversations</p>
              </div>
              <Switch 
                id="saveHistory" 
                checked={settings.chatSettings.saveHistory}
                onCheckedChange={(checked) => updateSettings({
                  chatSettings: {
                    ...settings.chatSettings,
                    saveHistory: checked
                  }
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Max History Items: {settings.chatSettings.maxHistoryItems}</Label>
              <Slider 
                min={10} 
                max={200} 
                step={10} 
                value={[settings.chatSettings.maxHistoryItems]} 
                onValueChange={(values) => updateSettings({
                  chatSettings: {
                    ...settings.chatSettings,
                    maxHistoryItems: values[0]
                  }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsDialog;
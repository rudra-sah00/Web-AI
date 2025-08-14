"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  FileText, 
  Wand2, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Info,
  Code,
  Copy
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import OllamaService from '@/services/OllamaService';

interface CustomModelTemplate {
  id: string;
  name: string;
  description: string;
  baseModel: string;
  modelfile: string;
  category: string;
}

export function CustomModelCreator() {
  const [isCreating, setIsCreating] = useState(false);
  const [modelName, setModelName] = useState('');
  const [baseModel, setBaseModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState('0.7');
  const [customModelfile, setCustomModelfile] = useState('');
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);
  const [creationStatus, setCreationStatus] = useState<{
    status: 'idle' | 'creating' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const templates: CustomModelTemplate[] = [
    {
      id: 'assistant',
      name: 'Custom Assistant',
      description: 'Create a specialized AI assistant with custom instructions',
      baseModel: 'llama3.2:3b',
      category: 'Assistant',
      modelfile: `FROM llama3.2:3b
PARAMETER temperature 0.7
PARAMETER top_p 0.9
SYSTEM """You are a helpful AI assistant designed to assist with specific tasks. You are professional, accurate, and provide detailed explanations when needed."""`
    },
    {
      id: 'coder',
      name: 'Code Assistant',
      description: 'Specialized assistant for programming and development tasks',
      baseModel: 'llama3.2:3b',
      category: 'Code',
      modelfile: `FROM llama3.2:3b
PARAMETER temperature 0.2
PARAMETER top_p 0.9
SYSTEM """You are an expert programming assistant. You provide clean, efficient, and well-documented code. You explain complex concepts clearly and suggest best practices."""`
    },
    {
      id: 'creative',
      name: 'Creative Writer',
      description: 'Optimized for creative writing and storytelling',
      baseModel: 'llama3.2:3b',
      category: 'Creative',
      modelfile: `FROM llama3.2:3b
PARAMETER temperature 0.9
PARAMETER top_p 0.95
SYSTEM """You are a creative writing assistant. You help with storytelling, character development, plot creation, and creative expression. You are imaginative and inspiring."""`
    }
  ];

  const generateModelfile = () => {
    if (useAdvancedMode) return customModelfile;
    
    let modelfile = `FROM ${baseModel || 'llama3.2:3b'}\n`;
    
    if (temperature) {
      modelfile += `PARAMETER temperature ${temperature}\n`;
    }
    
    if (systemPrompt) {
      modelfile += `SYSTEM """${systemPrompt}"""\n`;
    }
    
    return modelfile;
  };

  const createCustomModel = async () => {
    if (!modelName.trim()) {
      setCreationStatus({
        status: 'error',
        message: 'Please enter a model name'
      });
      return;
    }

    if (!useAdvancedMode && !baseModel.trim()) {
      setCreationStatus({
        status: 'error',
        message: 'Please select a base model'
      });
      return;
    }

    setIsCreating(true);
    setCreationStatus({
      status: 'creating',
      message: 'Creating custom model...'
    });

    try {
      const modelfile = generateModelfile();
      const result = await OllamaService.createModel(modelName.trim(), modelfile);
      
      if (result.status === 'success') {
        setCreationStatus({
          status: 'success',
          message: `Model "${modelName}" created successfully!`
        });
        
        // Reset form
        setTimeout(() => {
          setModelName('');
          setBaseModel('');
          setSystemPrompt('');
          setTemperature('0.7');
          setCustomModelfile('');
          setCreationStatus({ status: 'idle', message: '' });
        }, 3000);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setCreationStatus({
        status: 'error',
        message: `Failed to create model: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsCreating(false);
    }
  };

  const useTemplate = (template: CustomModelTemplate) => {
    setModelName('');
    setBaseModel(template.baseModel);
    setCustomModelfile(template.modelfile);
    setUseAdvancedMode(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Quick Templates</h3>
          <Badge variant="outline">3 templates</Badge>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  Base: {template.baseModel}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => useTemplate(template)}
                    className="flex-1"
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    Use Template
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Code className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{template.name} - Modelfile</DialogTitle>
                        <DialogDescription>
                          Preview the Modelfile for this template
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{template.modelfile}</code>
                          </pre>
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(template.modelfile)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Creation Form */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Create Custom Model</h3>
        </div>

        {/* Status Messages */}
        {creationStatus.status !== 'idle' && (
          <Alert className={
            creationStatus.status === 'success' ? 'border-green-200 bg-green-50 text-green-800' :
            creationStatus.status === 'error' ? 'border-red-200 bg-red-50 text-red-800' :
            'border-blue-200 bg-blue-50 text-blue-800'
          }>
            <div className="flex items-center gap-2">
              {creationStatus.status === 'creating' && <Loader2 className="h-4 w-4 animate-spin" />}
              {creationStatus.status === 'success' && <CheckCircle className="h-4 w-4" />}
              {creationStatus.status === 'error' && <AlertCircle className="h-4 w-4" />}
              <span>{creationStatus.message}</span>
            </div>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Settings</CardTitle>
              <CardDescription>
                Configure the basic parameters for your custom model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modelName">Model Name</Label>
                <Input
                  id="modelName"
                  placeholder="my-custom-model"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                />
              </div>

              {!useAdvancedMode && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="baseModel">Base Model</Label>
                    <Input
                      id="baseModel"
                      placeholder="llama3.2:3b"
                      value={baseModel}
                      onChange={(e) => setBaseModel(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">System Prompt</Label>
                    <Textarea
                      id="systemPrompt"
                      placeholder="You are a helpful assistant..."
                      value={systemPrompt}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSystemPrompt(e.target.value)}
                      rows={4}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="advancedMode"
                  checked={useAdvancedMode}
                  onChange={(e) => setUseAdvancedMode(e.target.checked)}
                />
                <Label htmlFor="advancedMode" className="text-sm">
                  Advanced Mode (Custom Modelfile)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Modelfile Preview/Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Modelfile {useAdvancedMode ? 'Editor' : 'Preview'}
              </CardTitle>
              <CardDescription>
                {useAdvancedMode 
                  ? 'Write your custom Modelfile with full control'
                  : 'Preview of the generated Modelfile'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {useAdvancedMode ? (
                <Textarea
                  value={customModelfile}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomModelfile(e.target.value)}
                  placeholder="FROM llama3.2:3b&#10;PARAMETER temperature 0.7&#10;SYSTEM &quot;&quot;&quot;You are a helpful assistant&quot;&quot;&quot;"
                  rows={12}
                  className="font-mono text-sm"
                />
              ) : (
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm min-h-[300px] overflow-x-auto">
                    <code>{generateModelfile() || 'Configure settings to see preview...'}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateModelfile())}
                    disabled={!generateModelfile()}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button 
            onClick={createCustomModel}
            disabled={isCreating || !modelName.trim()}
            className="flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Model
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              setModelName('');
              setBaseModel('');
              setSystemPrompt('');
              setTemperature('0.7');
              setCustomModelfile('');
              setUseAdvancedMode(false);
              setCreationStatus({ status: 'idle', message: '' });
            }}
          >
            Reset
          </Button>
        </div>

        {/* Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <div className="space-y-2">
            <p className="font-medium">Model Creation Tips:</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Use descriptive names for easy identification</li>
              <li>• Start with smaller base models for faster creation</li>
              <li>• Test system prompts thoroughly before finalizing</li>
              <li>• Lower temperature (0.1-0.3) for factual responses</li>
              <li>• Higher temperature (0.7-1.0) for creative tasks</li>
            </ul>
          </div>
        </Alert>
      </div>
    </div>
  );
}

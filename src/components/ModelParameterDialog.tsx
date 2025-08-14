"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Save, RotateCcw, Settings, Info } from 'lucide-react';
import { useOllamaSettings } from '@/services/hooks/useOllamaSettings';
import { ModelParameters } from '@/services/types';

interface ModelParameterDialogProps {
  modelId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ModelParameterDialog({ modelId, isOpen, onClose }: ModelParameterDialogProps) {
  const [localParams, setLocalParams] = useState<ModelParameters | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { 
    getModelParameters, 
    updateModelParameters, 
    resetModelParameters,
    getParameterDescriptions 
  } = useOllamaSettings();

  // Load parameters when dialog opens or model changes
  useEffect(() => {
    if (modelId && isOpen) {
      const params = getModelParameters(modelId);
      setLocalParams(params);
    }
  }, [modelId, isOpen, getModelParameters]);

  const handleParameterChange = (param: string, value: number) => {
    if (!localParams) return;
    setLocalParams(prev => prev ? { ...prev, [param]: value } : null);
  };

  const handleSave = async () => {
    if (!modelId || !localParams) return;
    
    setIsSaving(true);
    try {
      const success = await updateModelParameters(modelId, localParams);
      if (success) {
        onClose();
      } else {
        alert('Failed to save parameters. Please try again.');
      }
    } catch (error) {
      console.error('Error saving parameters:', error);
      alert('Error saving parameters. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!modelId) return;
    
    const confirmed = confirm('Are you sure you want to reset all parameters to default values?');
    if (!confirmed) return;

    try {
      const success = await resetModelParameters(modelId);
      if (success) {
        const resetParams = getModelParameters(modelId);
        setLocalParams(resetParams);
      } else {
        alert('Failed to reset parameters. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting parameters:', error);
      alert('Error resetting parameters. Please try again.');
    }
  };

  const parameterDescriptions = getParameterDescriptions();

  if (!modelId || !localParams) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Model Parameters - {modelId}
          </DialogTitle>
          <DialogDescription>
            Adjust the parameters for this model. Changes will be saved and persist across sessions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Temperature */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Temperature</Label>
                    <p className="text-sm text-muted-foreground">
                      {parameterDescriptions.temperature}
                    </p>
                  </div>
                  <Badge variant="secondary">{localParams.temperature}</Badge>
                </div>
                <Slider
                  value={[localParams.temperature]}
                  onValueChange={([value]) => handleParameterChange('temperature', value)}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 (Focused)</span>
                  <span>1 (Balanced)</span>
                  <span>2 (Creative)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Top P */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Top P</Label>
                    <p className="text-sm text-muted-foreground">
                      {parameterDescriptions.top_p}
                    </p>
                  </div>
                  <Badge variant="secondary">{localParams.top_p}</Badge>
                </div>
                <Slider
                  value={[localParams.top_p]}
                  onValueChange={([value]) => handleParameterChange('top_p', value)}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 (Restricted)</span>
                  <span>0.5 (Balanced)</span>
                  <span>1 (Unrestricted)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Max Tokens */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Max Tokens</Label>
                    <p className="text-sm text-muted-foreground">
                      {parameterDescriptions.max_tokens}
                    </p>
                  </div>
                  <Badge variant="secondary">{localParams.max_tokens}</Badge>
                </div>
                <Slider
                  value={[localParams.max_tokens]}
                  onValueChange={([value]) => handleParameterChange('max_tokens', value)}
                  min={1}
                  max={8192}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 (Very Short)</span>
                  <span>2048 (Medium)</span>
                  <span>8192 (Long)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Top K */}
          {localParams.top_k !== undefined && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Top K</Label>
                      <p className="text-sm text-muted-foreground">
                        {parameterDescriptions.top_k}
                      </p>
                    </div>
                    <Badge variant="secondary">{localParams.top_k}</Badge>
                  </div>
                  <Slider
                    value={[localParams.top_k]}
                    onValueChange={([value]) => handleParameterChange('top_k', value)}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 (Very Focused)</span>
                    <span>40 (Balanced)</span>
                    <span>100 (Diverse)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Repeat Penalty */}
          {localParams.repeat_penalty !== undefined && (
            <>
              <Separator />
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Repeat Penalty</Label>
                        <p className="text-sm text-muted-foreground">
                          {parameterDescriptions.repeat_penalty}
                        </p>
                      </div>
                      <Badge variant="secondary">{localParams.repeat_penalty}</Badge>
                    </div>
                    <Slider
                      value={[localParams.repeat_penalty]}
                      onValueChange={([value]) => handleParameterChange('repeat_penalty', value)}
                      min={0.1}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.1 (Strong Penalty)</span>
                      <span>1.0 (No Penalty)</span>
                      <span>2.0 (Encourage Repetition)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Context Window */}
          {localParams.num_ctx !== undefined && (
            <>
              <Separator />
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Context Window</Label>
                        <p className="text-sm text-muted-foreground">
                          {parameterDescriptions.num_ctx}
                        </p>
                      </div>
                      <Badge variant="secondary">{localParams.num_ctx}</Badge>
                    </div>
                    <Slider
                      value={[localParams.num_ctx]}
                      onValueChange={([value]) => handleParameterChange('num_ctx', value)}
                      min={512}
                      max={8192}
                      step={512}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>512 (Short)</span>
                      <span>2048 (Standard)</span>
                      <span>8192 (Long)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Seed */}
          {localParams.seed !== undefined && (
            <>
              <Separator />
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Seed</Label>
                        <p className="text-sm text-muted-foreground">
                          {parameterDescriptions.seed}
                        </p>
                      </div>
                      <Badge variant="secondary">{localParams.seed === -1 ? 'Random' : localParams.seed}</Badge>
                    </div>
                    <Slider
                      value={[localParams.seed === -1 ? 0 : localParams.seed]}
                      onValueChange={([value]) => handleParameterChange('seed', value === 0 ? -1 : value)}
                      min={0}
                      max={1000000}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0 (Random)</span>
                      <span>500000 (Medium)</span>
                      <span>1000000 (High)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Parameter Persistence</p>
                <p>
                  These parameters will be saved to your configuration file and persist across browser sessions. 
                  They will be used whenever this model is selected for chat.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Parameters
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

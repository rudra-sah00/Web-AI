"use client";

import React, { useEffect } from 'react';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, RotateCcw } from 'lucide-react';
import { useSettings } from '@/services/SettingsService';

export function AppearanceSettings() {
  const { settings, updateSetting, resetSettings, exportSettings, importSettings } = useSettings();

  const fontFamilies = [
    { value: 'system', label: 'System Default' },
    { value: 'inter', label: 'Inter' },
    { value: 'roboto', label: 'Roboto' },
    { value: 'open-sans', label: 'Open Sans' },
    { value: 'source-code-pro', label: 'Source Code Pro (Monospace)' },
    { value: 'fira-code', label: 'Fira Code (Monospace)' }
  ];

  const accentColors = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
    { value: 'indigo', label: 'Indigo', color: 'bg-indigo-500' },
    { value: 'teal', label: 'Teal', color: 'bg-teal-500' }
  ];

  // Apply settings to DOM when they change
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font size
    root.style.setProperty('--base-font-size', `${settings.fontSize}px`);
    
    // Apply font family
    const fontFamilyMap: Record<string, string> = {
      'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'inter': '"Inter", sans-serif',
      'roboto': '"Roboto", sans-serif',
      'open-sans': '"Open Sans", sans-serif',
      'source-code-pro': '"Source Code Pro", monospace',
      'fira-code': '"Fira Code", monospace'
    };
    
    if (fontFamilyMap[settings.fontFamily]) {
      root.style.setProperty('--font-family', fontFamilyMap[settings.fontFamily]);
    }
    
    // Apply compact mode
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    
    // Apply animations
    if (!settings.animationsEnabled) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }

    // Apply accent color
    root.setAttribute('data-accent-color', settings.accentColor);
  }, [settings]);

  const handleExportSettings = () => {
    const settingsJson = exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appearance-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const success = await importSettings(text);
        if (success) {
          alert('Settings imported successfully!');
        } else {
          alert('Failed to import settings. Please check the file format.');
        }
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Theme</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Choose your preferred color theme
          </p>
        </div>
        <ThemeSelector size="default" />
      </div>

      <Separator />

      {/* Accent Color */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Accent Color</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Choose your preferred accent color for highlights and buttons
          </p>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {accentColors.map((color) => (
            <div
              key={color.value}
              className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                settings.accentColor === color.value 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => updateSetting('accentColor', color.value)}
            >
              <div className={`w-4 h-4 rounded-full ${color.color}`} />
              <span className="text-sm font-medium">{color.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Font Settings */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Typography</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Customize text appearance and readability
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Font Family */}
          <div className="space-y-3">
            <Label>Font Family</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {fontFamilies.map((font) => (
                <div
                  key={font.value}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    settings.fontFamily === font.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => updateSetting('fontFamily', font.value)}
                >
                  <span className="text-sm font-medium">{font.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Font Size</Label>
              <Badge variant="secondary">{settings.fontSize}px</Badge>
            </div>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => updateSetting('fontSize', value)}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>12px</span>
              <span>24px</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Interface Options */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Interface Options</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Customize the overall interface behavior and appearance
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing and padding for a more compact interface
              </p>
            </div>
            <Switch
              id="compact-mode"
              checked={settings.compactMode}
              onCheckedChange={(checked) => updateSetting('compactMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">Enable Animations</Label>
              <p className="text-sm text-muted-foreground">
                Enable smooth transitions and animations throughout the interface
              </p>
            </div>
            <Switch
              id="animations"
              checked={settings.animationsEnabled}
              onCheckedChange={(checked) => updateSetting('animationsEnabled', checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Settings Management */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Settings Management</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Export, import, or reset your appearance settings
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExportSettings} className="gap-2">
            <Download className="h-4 w-4" />
            Export Settings
          </Button>
          
          <Button variant="outline" onClick={handleImportSettings} className="gap-2">
            <Upload className="h-4 w-4" />
            Import Settings
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              if (confirm('Are you sure you want to reset all appearance settings to default?')) {
                resetSettings();
              }
            }}
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useEffect } from 'react';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAppearanceSettings } from '@/services/AppearanceSettingsService';

export function AppearanceSettings() {
  const { settings, updateSetting, updateTheme, updateFontSettings } = useAppearanceSettings();

  const fontFamilies = [
    { value: 'system', label: 'System Default', category: 'System' },
    { value: 'inter', label: 'Inter', category: 'Sans Serif' },
    { value: 'roboto', label: 'Roboto', category: 'Sans Serif' },
    { value: 'poppins', label: 'Poppins', category: 'Sans Serif' },
    { value: 'ubuntu', label: 'Ubuntu', category: 'Sans Serif' },
    { value: 'open-sans', label: 'Open Sans', category: 'Sans Serif' },
    { value: 'fira-code', label: 'Fira Code', category: 'Monospace' },
    { value: 'jetbrains-mono', label: 'JetBrains Mono', category: 'Monospace' },
    { value: 'source-code-pro', label: 'Source Code Pro', category: 'Monospace' }
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
      'poppins': '"Poppins", sans-serif',
      'ubuntu': '"Ubuntu", sans-serif',
      'open-sans': '"Open Sans", sans-serif',
      'source-code-pro': '"Source Code Pro", monospace',
      'fira-code': '"Fira Code", monospace',
      'jetbrains-mono': '"JetBrains Mono", monospace'
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
  }, [settings]);

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
            
            {/* Group fonts by category */}
            {['System', 'Sans Serif', 'Monospace'].map((category) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {fontFamilies
                    .filter(font => font.category === category)
                    .map((font) => (
                      <div
                        key={font.value}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                          settings.fontFamily === font.value 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => updateSetting('fontFamily', font.value)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{font.label}</span>
                          {settings.fontFamily === font.value && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <div 
                          className="text-xs text-muted-foreground mt-1"
                          style={{ 
                            fontFamily: font.value === 'system' ? 'system-ui' : font.value 
                          }}
                        >
                          The quick brown fox jumps
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
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
    </div>
  );
}
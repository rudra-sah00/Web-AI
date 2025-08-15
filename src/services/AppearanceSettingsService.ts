import React from 'react';
import { BaseSettingsService } from './BaseSettingsService';
import { AppearanceSettings } from './types/SettingsTypes';

// Default appearance settings
const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  theme: 'dark',
  fontSize: 16,
  fontFamily: 'system',
  compactMode: false,
  animationsEnabled: true,
};

// Appearance settings service
class AppearanceSettingsService extends BaseSettingsService<AppearanceSettings> {
  constructor() {
    super(DEFAULT_APPEARANCE_SETTINGS, 'appearance');
  }

  // Apply theme to DOM when it changes
  async updateTheme(theme: AppearanceSettings['theme']): Promise<boolean> {
    const success = await this.updateSetting('theme', theme);
    if (success && typeof window !== 'undefined') {
      this.applyTheme(theme);
    }
    return success;
  }

  // Apply font settings to DOM
  async updateFontSettings(fontSize: number, fontFamily: string): Promise<boolean> {
    const success = await Promise.all([
      this.updateSetting('fontSize', fontSize),
      this.updateSetting('fontFamily', fontFamily)
    ]);
    
    if (success.every(s => s) && typeof window !== 'undefined') {
      this.applyFontSettings(fontSize, fontFamily);
    }
    
    return success.every(s => s);
  }

  // Apply theme to DOM
  private applyTheme(theme: string): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.className = root.className.replace(/theme-\S+/g, '');
    root.classList.add(`theme-${theme}`);
  }

  // Apply font settings to DOM
  private applyFontSettings(fontSize: number, fontFamily: string): void {
    const root = document.documentElement;
    root.style.setProperty('--base-font-size', `${fontSize}px`);
    
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
    
    if (fontFamilyMap[fontFamily]) {
      root.style.setProperty('--font-family', fontFamilyMap[fontFamily]);
    }
  }

  // Apply all appearance settings to DOM
  applyAllSettings(): void {
    if (typeof window === 'undefined') return;
    
    const settings = this.getSettings();
    const root = document.documentElement;
    
    // Apply theme
    this.applyTheme(settings.theme);
    
    // Apply font settings
    this.applyFontSettings(settings.fontSize, settings.fontFamily);
    
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
  }
}

// Create singleton instance
const appearanceSettingsService = new AppearanceSettingsService();

// React hook for appearance settings
export function useAppearanceSettings() {
  const [settings, setSettings] = React.useState<AppearanceSettings>(
    appearanceSettingsService.getSettings()
  );

  React.useEffect(() => {
    const unsubscribe = appearanceSettingsService.subscribe(setSettings);
    
    // Apply settings on mount
    appearanceSettingsService.applyAllSettings();
    
    return unsubscribe;
  }, []);

  return {
    settings,
    updateSetting: appearanceSettingsService.updateSetting.bind(appearanceSettingsService),
    updateTheme: appearanceSettingsService.updateTheme.bind(appearanceSettingsService),
    updateFontSettings: appearanceSettingsService.updateFontSettings.bind(appearanceSettingsService),
    updateSettings: appearanceSettingsService.updateSettings.bind(appearanceSettingsService),
    refresh: appearanceSettingsService.refresh.bind(appearanceSettingsService)
  };
}

export default appearanceSettingsService;

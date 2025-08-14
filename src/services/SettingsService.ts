import React from 'react';

export interface UserSettings {
  // Ollama Connection
  ollamaEndpoint: string;
  ollamaApiKey?: string;
  
  // Appearance
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: string;
  compactMode: boolean;
  animationsEnabled: boolean;
  accentColor: string;
  
  // Chat Settings
  streamResponses: boolean;
  saveHistory: boolean;
  maxHistoryItems: number;
  autoSave: boolean;
  showTimestamps: boolean;
  enableMarkdown: boolean;
  enableCodeHighlighting: boolean;
  defaultSystemPrompt: string;
  
  // Model Parameters (defaults)
  defaultTemperature: number;
  defaultTopP: number;
  defaultMaxTokens: number;
  defaultModel: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  // Ollama Connection
  ollamaEndpoint: 'http://localhost:11434',
  
  // Appearance
  theme: 'system',
  fontSize: 16,
  fontFamily: 'system',
  compactMode: false,
  animationsEnabled: true,
  accentColor: 'blue',
  
  // Chat Settings
  streamResponses: true,
  saveHistory: true,
  maxHistoryItems: 100,
  autoSave: true,
  showTimestamps: false,
  enableMarkdown: true,
  enableCodeHighlighting: true,
  defaultSystemPrompt: '',
  
  // Model Parameters
  defaultTemperature: 0.7,
  defaultTopP: 0.9,
  defaultMaxTokens: 2048,
  defaultModel: 'llama3.2:3b'
};

class SettingsService {
  private settings: UserSettings = { ...DEFAULT_SETTINGS };
  private subscribers: ((settings: UserSettings) => void)[] = [];

  constructor() {
    this.loadSettings();
  }

  /**
   * Load settings from localStorage and server
   */
  async loadSettings(): Promise<UserSettings> {
    try {
      // First try localStorage for immediate response
      const localSettings = localStorage.getItem('user-settings');
      if (localSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(localSettings) };
      }

      // Then sync with server
      const response = await fetch('/api/settings');
      if (response.ok) {
        const serverSettings = await response.json();
        this.settings = { ...DEFAULT_SETTINGS, ...serverSettings };
        
        // Update localStorage cache
        localStorage.setItem('user-settings', JSON.stringify(this.settings));
        
        // Notify subscribers
        this.notifySubscribers();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    
    return this.settings;
  }

  /**
   * Save settings to localStorage and server
   */
  async saveSettings(newSettings: Partial<UserSettings>): Promise<boolean> {
    try {
      // Update local settings
      this.settings = { ...this.settings, ...newSettings };
      
      // Save to localStorage immediately
      localStorage.setItem('user-settings', JSON.stringify(this.settings));
      
      // Save to server
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.settings),
      });

      if (response.ok) {
        // Notify subscribers of changes
        this.notifySubscribers();
        return true;
      } else {
        console.error('Failed to save settings to server');
        return false;
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  /**
   * Get current settings
   */
  getSettings(): UserSettings {
    return { ...this.settings };
  }

  /**
   * Get a specific setting
   */
  getSetting<K extends keyof UserSettings>(key: K): UserSettings[K] {
    return this.settings[key];
  }

  /**
   * Update a specific setting
   */
  async updateSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]): Promise<boolean> {
    return this.saveSettings({ [key]: value } as Partial<UserSettings>);
  }

  /**
   * Subscribe to settings changes
   */
  subscribe(callback: (settings: UserSettings) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Apply theme settings to document
   */
  applyThemeSettings(): void {
    const root = document.documentElement;
    
    // Apply font size
    root.style.setProperty('--base-font-size', `${this.settings.fontSize}px`);
    
    // Apply font family
    const fontFamilyMap: Record<string, string> = {
      'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'inter': '"Inter", sans-serif',
      'roboto': '"Roboto", sans-serif',
      'open-sans': '"Open Sans", sans-serif',
      'source-code-pro': '"Source Code Pro", monospace',
      'fira-code': '"Fira Code", monospace'
    };
    
    if (fontFamilyMap[this.settings.fontFamily]) {
      root.style.setProperty('--font-family', fontFamilyMap[this.settings.fontFamily]);
    }
    
    // Apply compact mode
    if (this.settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    
    // Apply animations
    if (!this.settings.animationsEnabled) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<boolean> {
    return this.saveSettings(DEFAULT_SETTINGS);
  }

  /**
   * Export settings as JSON
   */
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  async importSettings(jsonString: string): Promise<boolean> {
    try {
      const importedSettings = JSON.parse(jsonString);
      return this.saveSettings(importedSettings);
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.settings));
  }
}

// Create singleton instance
const settingsService = new SettingsService();

// React hook for using settings
export function useSettings() {
  const [settings, setSettings] = React.useState<UserSettings>(settingsService.getSettings());

  React.useEffect(() => {
    const unsubscribe = settingsService.subscribe(setSettings);
    return unsubscribe;
  }, []);

  return {
    settings,
    updateSetting: settingsService.updateSetting.bind(settingsService),
    saveSettings: settingsService.saveSettings.bind(settingsService),
    resetSettings: settingsService.resetSettings.bind(settingsService),
    exportSettings: settingsService.exportSettings.bind(settingsService),
    importSettings: settingsService.importSettings.bind(settingsService)
  };
}

export default settingsService;

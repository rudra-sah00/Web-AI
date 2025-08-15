import React from 'react';
import { BaseSettingsService } from './BaseSettingsService';
import { ChatSettings } from './types/SettingsTypes';

// Default chat settings
const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  streamResponses: true,
  saveHistory: true,
  maxHistoryItems: 100,
  autoSave: true,
  showTimestamps: false,
  enableMarkdown: true,
  enableCodeHighlighting: true,
  defaultSystemPrompt: "You are a helpful AI assistant. Be concise and accurate in your responses.",
  webSearchEnabled: false,
};

// Chat settings service
class ChatSettingsService extends BaseSettingsService<ChatSettings> {
  constructor() {
    super(DEFAULT_CHAT_SETTINGS, 'chat');
  }

  // Get system prompt
  getSystemPrompt(): string {
    return this.getSettings().defaultSystemPrompt;
  }

  // Update system prompt
  async updateSystemPrompt(prompt: string): Promise<boolean> {
    return this.updateSetting('defaultSystemPrompt', prompt);
  }

  // Check if feature is enabled
  isFeatureEnabled(feature: keyof ChatSettings): boolean {
    const settings = this.getSettings();
    return Boolean(settings[feature]);
  }

  // Toggle a boolean setting
  async toggleSetting(key: keyof ChatSettings): Promise<boolean> {
    const current = this.getSettings()[key];
    if (typeof current === 'boolean') {
      return this.updateSetting(key, !current as ChatSettings[keyof ChatSettings]);
    }
    return false;
  }

  // Update history settings
  async updateHistorySettings(saveHistory: boolean, maxHistoryItems: number): Promise<boolean> {
    const success = await Promise.all([
      this.updateSetting('saveHistory', saveHistory),
      this.updateSetting('maxHistoryItems', maxHistoryItems)
    ]);
    
    return success.every(s => s);
  }
}

// Create singleton instance
const chatSettingsService = new ChatSettingsService();

// React hook for chat settings
export function useChatSettings() {
  const [settings, setSettings] = React.useState<ChatSettings>(
    chatSettingsService.getSettings()
  );

  React.useEffect(() => {
    const unsubscribe = chatSettingsService.subscribe(setSettings);
    return unsubscribe;
  }, []);

  return {
    settings,
    updateSetting: chatSettingsService.updateSetting.bind(chatSettingsService),
    updateSystemPrompt: chatSettingsService.updateSystemPrompt.bind(chatSettingsService),
    toggleSetting: chatSettingsService.toggleSetting.bind(chatSettingsService),
    updateHistorySettings: chatSettingsService.updateHistorySettings.bind(chatSettingsService),
    isFeatureEnabled: chatSettingsService.isFeatureEnabled.bind(chatSettingsService),
    updateSettings: chatSettingsService.updateSettings.bind(chatSettingsService),
    refresh: chatSettingsService.refresh.bind(chatSettingsService)
  };
}

export default chatSettingsService;

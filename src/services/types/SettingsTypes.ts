// Types for different setting categories
export interface AppearanceSettings {
  theme: 'dark' | 'dark-slate' | 'dark-zinc' | 'dark-gray';
  fontSize: number;
  fontFamily: string;
  compactMode: boolean;
  animationsEnabled: boolean;
}

export interface ChatSettings {
  streamResponses: boolean;
  saveHistory: boolean;
  maxHistoryItems: number;
  autoSave: boolean;
  showTimestamps: boolean;
  enableMarkdown: boolean;
  enableCodeHighlighting: boolean;
  defaultSystemPrompt: string;
  webSearchEnabled: boolean;
}

export interface ModelSettings {
  defaultTemperature: number;
  defaultTopP: number;
  defaultMaxTokens: number;
  defaultModel: string;
  ollamaEndpoint: string;
  ollamaApiKey?: string;
}

export interface ConnectionSettings {
  ollamaEndpoint: string;
  ollamaApiKey?: string;
  connectionTimeout: number;
  retryAttempts: number;
}

export type SettingsCategory = 'appearance' | 'chat' | 'model' | 'connection';

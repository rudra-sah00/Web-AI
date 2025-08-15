// Real-time settings sync service
import appearanceSettingsService from './AppearanceSettingsService';
import chatSettingsService from './ChatSettingsService';
import modelSettingsService from './ModelSettingsService';

class SettingsSyncService {
  private pollingInterval: number = 2000; // 2 seconds
  private intervalIds: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  // Setup cross-tab communication
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith('settings-sync-')) {
        const category = e.key.replace('settings-sync-', '');
        this.handleRemoteSettingsChange(category);
      }
    });

    // Listen for focus events to refresh settings
    window.addEventListener('focus', () => {
      this.refreshAllSettings();
    });
  }

  // Handle settings changes from other tabs
  private async handleRemoteSettingsChange(category: string): Promise<void> {
    try {
      switch (category) {
        case 'appearance':
          await appearanceSettingsService.refresh();
          break;
        case 'chat':
          await chatSettingsService.refresh();
          break;
        case 'model':
          await modelSettingsService.refresh();
          break;
      }
    } catch (error) {
      console.error(`Error syncing ${category} settings:`, error);
    }
  }

  // Trigger sync to other tabs
  triggerSync(category: string): void {
    if (typeof window === 'undefined') return;
    
    // Use localStorage to signal other tabs
    const timestamp = Date.now().toString();
    localStorage.setItem(`settings-sync-${category}`, timestamp);
    
    // Clean up old entries
    setTimeout(() => {
      localStorage.removeItem(`settings-sync-${category}`);
    }, 1000);
  }

  // Start real-time polling for a category
  startPolling(category: string): void {
    if (this.intervalIds.has(category)) return;

    const intervalId = setInterval(async () => {
      try {
        switch (category) {
          case 'appearance':
            await appearanceSettingsService.refresh();
            break;
          case 'chat':
            await chatSettingsService.refresh();
            break;
          case 'model':
            await modelSettingsService.refresh();
            break;
        }
      } catch (error) {
        console.error(`Error polling ${category} settings:`, error);
      }
    }, this.pollingInterval);

    this.intervalIds.set(category, intervalId);
  }

  // Stop polling for a category
  stopPolling(category: string): void {
    const intervalId = this.intervalIds.get(category);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervalIds.delete(category);
    }
  }

  // Start polling for all categories
  startAllPolling(): void {
    this.startPolling('appearance');
    this.startPolling('chat');
    this.startPolling('model');
  }

  // Stop all polling
  stopAllPolling(): void {
    this.intervalIds.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.intervalIds.clear();
  }

  // Refresh all settings manually
  async refreshAllSettings(): Promise<void> {
    try {
      await Promise.all([
        appearanceSettingsService.refresh(),
        chatSettingsService.refresh(),
        modelSettingsService.refresh()
      ]);
    } catch (error) {
      console.error('Error refreshing all settings:', error);
    }
  }

  // Set polling interval
  setPollingInterval(ms: number): void {
    this.pollingInterval = ms;
    
    // Restart polling with new interval
    this.stopAllPolling();
    this.startAllPolling();
  }
}

// Create singleton instance
const settingsSyncService = new SettingsSyncService();

// Auto-start polling when service is imported
if (typeof window !== 'undefined') {
  settingsSyncService.startAllPolling();
}

export default settingsSyncService;

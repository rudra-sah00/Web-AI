// Base settings service for handling JSON file operations
export class BaseSettingsService<T> {
  private settings: T;
  private readonly fileName: string;
  private subscribers: Array<(settings: T) => void> = [];

  constructor(defaultSettings: T, fileName: string) {
    this.settings = defaultSettings;
    this.fileName = fileName;
    this.loadSettings();
  }

  // Load settings from the API/JSON file
  private async loadSettings(): Promise<void> {
    try {
      const response = await fetch(`/api/settings/${this.fileName}`);
      if (response.ok) {
        const data = await response.json();
        this.settings = { ...this.settings, ...data };
        this.notifySubscribers();
      }
    } catch (error) {
      console.error(`Error loading ${this.fileName} settings:`, error);
    }
  }

  // Save settings to the API/JSON file
  private async saveSettings(): Promise<boolean> {
    try {
      const response = await fetch(`/api/settings/${this.fileName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.settings),
      });
      
      if (response.ok) {
        this.notifySubscribers();
        
        // Trigger cross-tab sync
        if (typeof window !== 'undefined') {
          this.triggerSync();
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error saving ${this.fileName} settings:`, error);
      return false;
    }
  }

  // Trigger sync to other tabs
  private triggerSync(): void {
    const timestamp = Date.now().toString();
    localStorage.setItem(`settings-sync-${this.fileName}`, timestamp);
    
    // Clean up old entries
    setTimeout(() => {
      localStorage.removeItem(`settings-sync-${this.fileName}`);
    }, 1000);
  }

  // Get current settings
  getSettings(): T {
    return this.settings;
  }

  // Update a specific setting
  async updateSetting<K extends keyof T>(key: K, value: T[K]): Promise<boolean> {
    this.settings[key] = value;
    return this.saveSettings();
  }

  // Update multiple settings
  async updateSettings(newSettings: Partial<T>): Promise<boolean> {
    this.settings = { ...this.settings, ...newSettings };
    return this.saveSettings();
  }

  // Subscribe to settings changes
  subscribe(callback: (settings: T) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Notify all subscribers
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.settings));
  }

  // Refresh settings from file (for real-time sync)
  async refresh(): Promise<void> {
    await this.loadSettings();
  }
}

// Base settings service for handling JSON file operations
export class BaseSettingsService<T> {
  private settings: T;
  private readonly fileName: string;
  private subscribers: Array<(settings: T) => void> = [];
  private isLoading: boolean = false;
  private loadPromise: Promise<void> | null = null;

  constructor(defaultSettings: T, fileName: string) {
    this.settings = { ...defaultSettings };
    this.fileName = fileName;
    this.loadPromise = this.loadSettings();
  }

  // Ensure settings are loaded before use
  async ensureLoaded(): Promise<void> {
    if (this.loadPromise) {
      await this.loadPromise;
      this.loadPromise = null;
    }
  }

  // Load settings from the API/JSON file
  private async loadSettings(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;
    
    try {
      // Only fetch in browser context
      if (typeof window === 'undefined') {
        return;
      }
      
      const response = await fetch(`/api/settings/${this.fileName}`);
      if (response.ok) {
        const data = await response.json();
        this.settings = { ...this.settings, ...data };
        console.log(`✅ Loaded ${this.fileName} settings:`, this.settings);
        this.notifySubscribers();
      }
    } catch (error) {
      console.error(`Error loading ${this.fileName} settings:`, error);
    } finally {
      this.isLoading = false;
    }
  }

  // Save settings to the API/JSON file
  private async saveSettings(): Promise<boolean> {
    try {
      // Only fetch in browser context
      if (typeof window === 'undefined') {
        return false;
      }
      
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

  // Get settings with loading guarantee
  async getSettingsAsync(): Promise<T> {
    await this.ensureLoaded();
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

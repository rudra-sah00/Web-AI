"use client";

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import configService from '@/services/ConfigService';

export function ChatSettings() {
  const [streamResponses, setStreamResponses] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [maxHistoryItems, setMaxHistoryItems] = useState([100]);
  const [autoSave, setAutoSave] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [enableMarkdown, setEnableMarkdown] = useState(true);
  const [enableCodeHighlighting, setEnableCodeHighlighting] = useState(true);
  const [defaultSystemPrompt, setDefaultSystemPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = configService.getSettings();
        setStreamResponses(settings.chatSettings.streamResponses);
        setSaveHistory(settings.chatSettings.saveHistory);
        setMaxHistoryItems([settings.chatSettings.maxHistoryItems]);
        
        // Load additional settings if they exist
        const chatConfig = localStorage.getItem('chatDisplaySettings');
        if (chatConfig) {
          const displaySettings = JSON.parse(chatConfig);
          setShowTimestamps(displaySettings.showTimestamps || false);
          setEnableMarkdown(displaySettings.enableMarkdown !== false);
          setEnableCodeHighlighting(displaySettings.enableCodeHighlighting !== false);
          setDefaultSystemPrompt(displaySettings.defaultSystemPrompt || '');
        }
      } catch (error) {
        console.error('Error loading chat settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save core chat settings
      await configService.updateSettings({
        chatSettings: {
          streamResponses,
          saveHistory,
          maxHistoryItems: maxHistoryItems[0]
        }
      });

      // Save display settings to localStorage
      const displaySettings = {
        showTimestamps,
        enableMarkdown,
        enableCodeHighlighting,
        defaultSystemPrompt
      };
      localStorage.setItem('chatDisplaySettings', JSON.stringify(displaySettings));
      
      alert('Chat settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Response Behavior */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Response Behavior</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Configure how chat responses are displayed and handled
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="stream-responses">Stream Responses</Label>
              <p className="text-sm text-muted-foreground">
                Show responses as they are generated in real-time
              </p>
            </div>
            <Switch
              id="stream-responses"
              checked={streamResponses}
              onCheckedChange={setStreamResponses}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-markdown">Enable Markdown Rendering</Label>
              <p className="text-sm text-muted-foreground">
                Format text with bold, italic, lists, and other markdown features
              </p>
            </div>
            <Switch
              id="enable-markdown"
              checked={enableMarkdown}
              onCheckedChange={setEnableMarkdown}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="code-highlighting">Code Syntax Highlighting</Label>
              <p className="text-sm text-muted-foreground">
                Highlight code blocks with syntax coloring
              </p>
            </div>
            <Switch
              id="code-highlighting"
              checked={enableCodeHighlighting}
              onCheckedChange={setEnableCodeHighlighting}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Chat History */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Chat History</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Manage how chat conversations are saved and stored
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="save-history">Save Chat History</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save conversations for future reference
              </p>
            </div>
            <Switch
              id="save-history"
              checked={saveHistory}
              onCheckedChange={setSaveHistory}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save">Auto-save Conversations</Label>
              <p className="text-sm text-muted-foreground">
                Save conversations automatically as you chat
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-history">Maximum History Items: {maxHistoryItems[0]}</Label>
            <Slider
              id="max-history"
              min={10}
              max={1000}
              step={10}
              value={maxHistoryItems}
              onValueChange={setMaxHistoryItems}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10 items</span>
              <span>1000 items</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Display Options */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Display Options</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Customize how chat messages are displayed
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-timestamps">Show Timestamps</Label>
              <p className="text-sm text-muted-foreground">
                Display when each message was sent
              </p>
            </div>
            <Switch
              id="show-timestamps"
              checked={showTimestamps}
              onCheckedChange={setShowTimestamps}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* System Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default System Prompt</CardTitle>
          <CardDescription>
            Set a default system prompt that will be used for new conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="system-prompt">System Prompt</Label>
            <textarea
              id="system-prompt"
              value={defaultSystemPrompt}
              onChange={(e) => setDefaultSystemPrompt(e.target.value)}
              placeholder="You are a helpful AI assistant..."
              className="w-full h-32 px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none rounded-md"
            />
            <p className="text-xs text-muted-foreground">
              This prompt will be sent at the beginning of each new conversation to set the AI's behavior and personality.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => setDefaultSystemPrompt('')}>
              Clear
            </Button>
            <Button size="sm" onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Global Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSaveSettings} disabled={isSaving} className="px-8">
          {isSaving ? 'Saving...' : 'Save All Chat Settings'}
        </Button>
      </div>
    </div>
  );
}

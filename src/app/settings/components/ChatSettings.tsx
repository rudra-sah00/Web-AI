"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useChatSettings } from '@/services/ChatSettingsService';

export function ChatSettings() {
  const { 
    settings, 
    updateSetting, 
    toggleSetting, 
    updateSystemPrompt 
  } = useChatSettings();

  const handleSystemPromptChange = async (prompt: string) => {
    await updateSystemPrompt(prompt);
  };

  const handleMaxHistoryChange = async (value: number[]) => {
    await updateSetting('maxHistoryItems', value[0]);
  };

  return (
    <div className="space-y-6">
      {/* Response Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Response Settings</CardTitle>
          <CardDescription>
            Configure how the AI responds to your messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="stream-responses">Stream Responses</Label>
              <p className="text-sm text-muted-foreground">
                Show AI responses as they are being generated
              </p>
            </div>
            <Switch
              id="stream-responses"
              checked={settings.streamResponses}
              onCheckedChange={() => toggleSetting('streamResponses')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="web-search">Web Search</Label>
              <p className="text-sm text-muted-foreground">
                Enable web search integration for current information
              </p>
            </div>
            <Switch
              id="web-search"
              checked={settings.webSearchEnabled}
              onCheckedChange={() => toggleSetting('webSearchEnabled')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chat History */}
      <Card>
        <CardHeader>
          <CardTitle>Chat History</CardTitle>
          <CardDescription>
            Manage how chat history is saved and displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="save-history">Save Chat History</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save conversations
              </p>
            </div>
            <Switch
              id="save-history"
              checked={settings.saveHistory}
              onCheckedChange={() => toggleSetting('saveHistory')}
            />
          </div>

          {settings.saveHistory && (
            <>
              <div className="space-y-2">
                <Label>Maximum History Items: {settings.maxHistoryItems}</Label>
                <Slider
                  value={[settings.maxHistoryItems]}
                  onValueChange={handleMaxHistoryChange}
                  max={500}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Number of messages to keep in history
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto Save</Label>
                  <p className="text-sm text-muted-foreground">
                    Save conversations automatically
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.autoSave}
                  onCheckedChange={() => toggleSetting('autoSave')}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>
            Customize how messages are displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-timestamps">Show Timestamps</Label>
              <p className="text-sm text-muted-foreground">
                Display message timestamps
              </p>
            </div>
            <Switch
              id="show-timestamps"
              checked={settings.showTimestamps}
              onCheckedChange={() => toggleSetting('showTimestamps')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-markdown">Enable Markdown</Label>
              <p className="text-sm text-muted-foreground">
                Render markdown formatting in messages
              </p>
            </div>
            <Switch
              id="enable-markdown"
              checked={settings.enableMarkdown}
              onCheckedChange={() => toggleSetting('enableMarkdown')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="code-highlighting">Code Highlighting</Label>
              <p className="text-sm text-muted-foreground">
                Syntax highlighting for code blocks
              </p>
            </div>
            <Switch
              id="code-highlighting"
              checked={settings.enableCodeHighlighting}
              onCheckedChange={() => toggleSetting('enableCodeHighlighting')}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card>
        <CardHeader>
          <CardTitle>System Prompt</CardTitle>
          <CardDescription>
            Set the default system prompt for new conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="system-prompt">Default System Prompt</Label>
            <textarea
              id="system-prompt"
              className="w-full min-h-[100px] p-3 rounded-md border border-border bg-background text-foreground resize-y"
              value={settings.defaultSystemPrompt}
              onChange={(e) => handleSystemPromptChange(e.target.value)}
              placeholder="Enter your default system prompt..."
            />
            <p className="text-sm text-muted-foreground">
              This prompt will be used for all new conversations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

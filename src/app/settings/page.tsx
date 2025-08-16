"use client";

import React from 'react';
import Link from 'next/link';
import { OllamaConnectionSettings } from './components/OllamaConnectionSettings';
import { ModelManagementSettings } from './components/ModelManagementSettings';
import { ChatSettings } from './components/ChatSettings';
import { AppearanceSettings } from './components/AppearanceSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, ExternalLink, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex flex-col space-y-8">
          {/* Header */}
          <div className="flex flex-col space-y-4">
            {/* Back Button */}
            <div className="flex items-center">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Chats
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground text-lg">
                  Configure your Ollama AI experience and manage your models
                </p>
              </div>
              <Link href="/models">
                <Button variant="secondary" className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                  <Package className="h-4 w-4" />
                  Models Library
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <Separator />

          {/* Settings Grid */}
          <div className="grid gap-8">
            {/* Ollama Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔗 Ollama Connection
                </CardTitle>
                <CardDescription>
                  Configure your connection to the Ollama service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OllamaConnectionSettings />
              </CardContent>
            </Card>

            {/* Model Management */}
            <Card id="model-management">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📦 Model Management
                </CardTitle>
                <CardDescription>
                  Manage your installed models, select which one to use, and configure model parameters. Click ⚙️ on any model to edit parameters, 📄 for info, 📋 to copy, or 🗑️ to delete.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ModelManagementSettings />
              </CardContent>
            </Card>

            {/* Chat Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💬 Chat Settings
                </CardTitle>
                <CardDescription>
                  Configure chat behavior and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChatSettings />
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎨 Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppearanceSettings />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { ModelInstaller } from './components/ModelInstaller';
import { ModelManager } from './components/ModelManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package, Search, Settings } from 'lucide-react';

export default function ModulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex flex-col space-y-8">
          {/* Header */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <Package className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Model Library</h1>
                <p className="text-muted-foreground text-lg">
                  Discover, install, and manage Ollama models from the web interface
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Available Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">100+</div>
                <p className="text-xs text-muted-foreground">
                  Pre-trained models ready to install
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Model Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Different model categories available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Web Installation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">✓</div>
                <p className="text-xs text-muted-foreground">
                  Install models directly from browser
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Model Browser */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Browse & Install Models
              </CardTitle>
              <CardDescription>
                Search and install models from the Ollama library. Models are downloaded and installed directly to your local Ollama instance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModelInstaller />
            </CardContent>
          </Card>

          {/* Model Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Installed Models
              </CardTitle>
              <CardDescription>
                Manage your locally installed models, create custom models, and configure model parameters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModelManager />
            </CardContent>
          </Card>

          {/* Info Section */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">🔍 Discovery</h4>
                  <p className="text-sm text-muted-foreground">
                    Browse our comprehensive library of pre-trained models categorized by use case, 
                    size, and capability. Each model includes detailed information about parameters, 
                    size, and recommended use cases.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">⬇️ Installation</h4>
                  <p className="text-sm text-muted-foreground">
                    Install models directly from your browser with real-time progress tracking. 
                    Models are downloaded to your local Ollama instance and ready to use immediately.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">⚙️ Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Manage installed models, view detailed information, copy models for 
                    customization, and remove models you no longer need. Full lifecycle management.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">🛠️ Customization</h4>
                  <p className="text-sm text-muted-foreground">
                    Create custom models using Modelfiles, copy existing models with modifications, 
                    and fine-tune model parameters for your specific use cases.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">💡 Pro Tip</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Start with smaller models (1B-7B parameters) if you're new to local AI. They run faster 
                  on most hardware and are perfect for learning. You can always install larger models later 
                  for more complex tasks.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

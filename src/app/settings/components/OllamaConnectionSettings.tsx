"use client";

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Loader2, AlertCircle, Settings, Wifi, WifiOff } from 'lucide-react';
import ollamaService from '@/services/OllamaService';

export function OllamaConnectionSettings() {
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:11434');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'error' | 'checking'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [ollamaVersion, setOllamaVersion] = useState<string | null>(null);

  useEffect(() => {
    // Load saved endpoint from localStorage
    const savedEndpoint = localStorage.getItem('ollama-endpoint');
    if (savedEndpoint) {
      setApiEndpoint(savedEndpoint);
    }
    
    // Check initial connection
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setConnectionMessage('Checking connection...');
    
    try {
      const status = await ollamaService.checkOllamaStatus();
      
      if (status.status === 'success') {
        setConnectionStatus('connected');
        setConnectionMessage('Connected to Ollama service');
        
        // Try to get version info
        try {
          const response = await fetch(`${apiEndpoint}/api/version`);
          if (response.ok) {
            const versionData = await response.json();
            setOllamaVersion(versionData.version || 'Unknown');
          }
        } catch (e) {
          console.log('Could not fetch version info');
        }
      } else {
        setConnectionStatus('error');
        setConnectionMessage(status.message);
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage('Failed to connect to Ollama service');
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Update the service endpoint
    ollamaService.setApiEndpoint(apiEndpoint);
    
    // Save to localStorage
    localStorage.setItem('ollama-endpoint', apiEndpoint);
    
    // Check connection
    await checkConnection();
    
    setIsConnecting(false);
  };

  const resetToDefault = () => {
    setApiEndpoint('http://localhost:11434');
    localStorage.removeItem('ollama-endpoint');
    ollamaService.setApiEndpoint('http://localhost:11434');
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><Wifi className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'error':
        return <Badge variant="destructive"><WifiOff className="h-3 w-3 mr-1" />Disconnected</Badge>;
      case 'checking':
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Checking...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            Current status of your Ollama service connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium">{connectionMessage}</p>
                {ollamaVersion && (
                  <p className="text-sm text-muted-foreground">Ollama v{ollamaVersion}</p>
                )}
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Connection Configuration */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Connection Configuration</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Configure the endpoint for your Ollama service
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-endpoint">API Endpoint</Label>
            <Input
              id="api-endpoint"
              type="url"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              placeholder="http://localhost:11434"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              The URL where your Ollama service is running. Default is http://localhost:11434
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleConnect}
              disabled={isConnecting || !apiEndpoint}
              className="flex items-center gap-2"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4" />
              )}
              {isConnecting ? 'Connecting...' : 'Test Connection'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={resetToDefault}
              disabled={isConnecting}
            >
              Reset to Default
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Help & Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Troubleshooting</CardTitle>
          <CardDescription>
            Common issues and solutions for Ollama connectivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Service not running:</strong> Make sure Ollama is installed and running on your system.</p>
            <p><strong>Connection refused:</strong> Check if the endpoint URL is correct and accessible.</p>
            <p><strong>CORS issues:</strong> Ollama may need to be configured to allow cross-origin requests.</p>
            <p><strong>Firewall:</strong> Ensure your firewall allows connections to the Ollama port (default 11434).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

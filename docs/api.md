# API Documentation

## Overview

Web-AI provides a RESTful API built on Next.js API routes for managing chats, configuration, and settings. All APIs are designed to work with the Ollama backend for AI model interactions.

## Base URL

```
http://localhost:3000/api
```

## API Endpoints

### Chat Management

#### Get All Chats
```http
GET /api/chats
```

**Response:**
```json
{
  "chats": [
    {
      "id": "chat-123",
      "title": "My Conversation",
      "messages": [],
      "messageCount": 5,
      "createdAt": "2025-08-15T10:00:00Z",
      "updatedAt": "2025-08-15T10:30:00Z"
    }
  ]
}
```

#### Get Specific Chat
```http
GET /api/chats/{id}
```

**Parameters:**
- `id` (string): Chat identifier

**Response:**
```json
{
  "id": "chat-123",
  "title": "My Conversation",
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "Hello!",
      "timestamp": "2025-08-15T10:00:00Z"
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "content": "Hi there! How can I help you?",
      "timestamp": "2025-08-15T10:00:30Z"
    }
  ],
  "messageCount": 2,
  "createdAt": "2025-08-15T10:00:00Z",
  "updatedAt": "2025-08-15T10:00:30Z"
}
```

#### Create/Update Chat
```http
POST /api/chats/{id}
```

**Request Body:**
```json
{
  "id": "chat-123",
  "title": "My Conversation",
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "Hello!",
      "timestamp": "2025-08-15T10:00:00Z"
    }
  ],
  "createdAt": "2025-08-15T10:00:00Z",
  "updatedAt": "2025-08-15T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat saved successfully"
}
```

#### Delete Chat
```http
DELETE /api/chats/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

### Configuration Management

#### Get Configuration
```http
GET /api/config
```

**Response:**
```json
{
  "defaultModel": "llama3.2:3b",
  "modelConfigs": {
    "llama3.2:3b": {
      "name": "Llama 3.2 3B",
      "parameters": {
        "temperature": 0.7,
        "top_p": 0.9,
        "max_tokens": 2048
      }
    }
  },
  "chatSettings": {
    "streamResponses": true,
    "showTimestamps": true
  },
  "appearanceSettings": {
    "theme": "dark",
    "fontSize": "medium"
  }
}
```

#### Update Configuration
```http
POST /api/config
```

**Request Body:**
```json
{
  "defaultModel": "llama3.1:8b",
  "chatSettings": {
    "streamResponses": true,
    "showTimestamps": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration updated successfully"
}
```

#### Load Configuration
```http
GET /api/config/load
```

**Response:**
```json
{
  "success": true,
  "config": {
    "defaultModel": "llama3.2:3b",
    "modelConfigs": {},
    "chatSettings": {},
    "appearanceSettings": {}
  }
}
```

#### Update Configuration
```http
POST /api/config/update
```

**Request Body:**
```json
{
  "path": "chatSettings.streamResponses",
  "value": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Setting updated successfully"
}
```

### Settings Management

#### Get Settings
```http
GET /api/settings
```

**Response:**
```json
{
  "ollamaSettings": {
    "baseUrl": "http://localhost:11434",
    "timeout": 30000
  },
  "chatSettings": {
    "streamResponses": true,
    "showTimestamps": true,
    "defaultSystemPrompt": "You are a helpful AI assistant."
  },
  "appearanceSettings": {
    "theme": "dark",
    "fontSize": "medium",
    "compactMode": false
  }
}
```

#### Update Settings
```http
POST /api/settings
```

**Request Body:**
```json
{
  "chatSettings": {
    "streamResponses": false,
    "showTimestamps": true
  },
  "appearanceSettings": {
    "theme": "light"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

## Data Models

### Chat Object
```typescript
interface Chat {
  id: string;
  title: string;
  messages: Message[];
  messageCount?: number;
  createdAt: string;
  updatedAt: string;
}
```

### Message Object
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
```

### Configuration Object
```typescript
interface AppSettings {
  defaultModel: string | null;
  modelConfigs: Record<string, ModelConfig>;
  chatSettings: ChatDisplaySettings;
  appearanceSettings: AppearanceSettings;
  ollamaSettings: OllamaConnectionSettings;
}
```

### Model Configuration
```typescript
interface ModelConfig {
  name: string;
  parameters: {
    temperature: number;
    top_p: number;
    top_k: number;
    max_tokens: number;
    repeat_penalty: number;
    seed: number;
    stop: string[];
  };
}
```

## Streaming API

### Chat Streaming

The chat system uses Server-Sent Events for real-time streaming responses:

```javascript
// Client-side streaming implementation
const response = await fetch('/api/ollama/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'llama3.2:3b',
    prompt: 'Hello!',
    stream: true
  })
});

const reader = response.body?.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = new TextDecoder().decode(value);
  const lines = chunk.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      if (data.response) {
        // Handle streaming chunk
        onChunk(data.response);
      }
    } catch (e) {
      console.warn('Error parsing chunk:', e);
    }
  }
}
```

### Streaming Response Format

```json
{
  "model": "llama3.2:3b",
  "created_at": "2025-08-15T10:00:00Z",
  "response": "Hello! How can I",
  "done": false
}
```

Final chunk:
```json
{
  "model": "llama3.2:3b",
  "created_at": "2025-08-15T10:00:00Z",
  "response": "",
  "done": true,
  "total_duration": 2000000000,
  "load_duration": 1000000000,
  "prompt_eval_count": 10,
  "prompt_eval_duration": 500000000,
  "eval_count": 20,
  "eval_duration": 1500000000
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": true,
  "message": "Detailed error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error context"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `CHAT_NOT_FOUND` | Chat with specified ID doesn't exist |
| `INVALID_REQUEST` | Request body validation failed |
| `OLLAMA_CONNECTION_ERROR` | Cannot connect to Ollama service |
| `MODEL_NOT_FOUND` | Specified AI model is not available |
| `CONFIG_LOAD_ERROR` | Failed to load configuration |
| `CONFIG_SAVE_ERROR` | Failed to save configuration |

### Error Examples

#### Chat Not Found
```json
{
  "error": true,
  "message": "Chat not found",
  "code": "CHAT_NOT_FOUND"
}
```

#### Ollama Connection Error
```json
{
  "error": true,
  "message": "Failed to connect to Ollama service",
  "code": "OLLAMA_CONNECTION_ERROR",
  "details": {
    "url": "http://localhost:11434",
    "timeout": 5000
  }
}
```

## Authentication

Currently, Web-AI runs locally and doesn't require authentication. All API endpoints are publicly accessible on your local machine.

## Rate Limiting

No rate limiting is implemented as the application runs locally. However, responses are limited by:
- Ollama model processing speed
- Available system resources (RAM, CPU)
- Model-specific token limits

## Development Examples

### Creating a New Chat
```javascript
async function createChat() {
  const newChat = {
    id: `chat-${Date.now()}`,
    title: 'New Conversation',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const response = await fetch(`/api/chats/${newChat.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newChat)
  });
  
  return await response.json();
}
```

### Updating Settings
```javascript
async function updateChatSettings(settings) {
  const response = await fetch('/api/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chatSettings: settings
    })
  });
  
  return await response.json();
}
```

### Getting Available Models
```javascript
async function getAvailableModels() {
  const response = await fetch('/api/ollama/models');
  const data = await response.json();
  return data.models || [];
}
```

## Testing

### Example API Tests

```javascript
// Test chat creation
test('should create a new chat', async () => {
  const chat = {
    id: 'test-chat',
    title: 'Test Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const response = await fetch('/api/chats/test-chat', {
    method: 'POST',
    body: JSON.stringify(chat)
  });
  
  expect(response.ok).toBe(true);
});

// Test configuration update
test('should update configuration', async () => {
  const config = {
    defaultModel: 'llama3.2:3b'
  };
  
  const response = await fetch('/api/config', {
    method: 'POST',
    body: JSON.stringify(config)
  });
  
  expect(response.ok).toBe(true);
});
```

This API documentation provides a comprehensive guide for integrating with and extending the Web-AI application.

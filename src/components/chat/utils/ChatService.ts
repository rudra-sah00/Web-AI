import { Chat, Message } from "../components/types";
import ollamaService from '@/services/OllamaService';
import configService from '@/services/ConfigService';
import { GenerationOptions } from '@/services/types';

export class ChatService {
  /**
   * Fetch chat data from API
   */
  static async fetchChat(chatId: string): Promise<Chat | null> {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      
      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching chat:', error);
      throw new Error('Network error while loading chat');
    }
  }

  /**
   * Create a new chat
   */
  static async createChat(chat: Chat): Promise<boolean> {
    try {
      const response = await fetch(`/api/chats/${chat.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chat),
      });

      if (!response.ok) {
        console.error('Error creating chat:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw new Error('Network error while creating chat');
    }
  }

  /**
   * Update an existing chat
   */
  static async updateChat(chat: Chat): Promise<boolean> {
    try {
      const response = await fetch(`/api/chats/${chat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chat),
      });

      if (!response.ok) {
        console.error('Error saving chat:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving chat:', error);
      throw new Error('Network error while saving');
    }
  }

  /**
   * Generate a response using the selected Ollama model
   * @returns Promise that resolves to the generated text or error message
   */
  static async generateResponse(prompt: string, chatHistory: Message[] = []): Promise<string> {
    try {
      console.log('🤖 Starting AI response generation...');
      
      // Get app settings and current model from config
      const settings = configService.getSettings();
      console.log('⚙️ Settings loaded:', settings);
      
      // Look for the model in the proper location according to AppSettings interface
      const selectedModelId = settings.defaultModel;
      console.log('🎯 Selected model ID:', selectedModelId);
      
      if (!selectedModelId || selectedModelId === null) {
        throw new Error("Please select a model first! Go to Settings → Models to choose a model before starting a chat.");
      }

      // Get model parameters if configured
      const modelConfig = configService.getModelConfig(selectedModelId);
      console.log('📋 Model config:', modelConfig);
      
      if (!modelConfig) {
        throw new Error(`Model configuration for ${selectedModelId} not found.`);
      }

      // Check if Ollama service is running
      console.log('🔍 Checking Ollama status...');
      const status = await ollamaService.checkOllamaStatus();
      console.log('📊 Ollama status:', status);
      
      if (status.status === 'error') {
        throw new Error(`Ollama service error: ${status.message}`);
      }

      // Build context from chat history (last few messages for better context)
      const contextLimit = 10; // Use last 10 messages for context
      const relevantHistory = chatHistory.slice(-contextLimit);
      
      // Get default system prompt from settings
      let systemPrompt = '';
      const displaySettings = typeof window !== 'undefined' ? localStorage.getItem('chatDisplaySettings') : null;
      let defaultSystemPrompt = '';
      if (displaySettings) {
        const settings = JSON.parse(displaySettings);
        defaultSystemPrompt = settings.defaultSystemPrompt || '';
      }
      
      // Format conversation context like ChatGPT
      let conversationContext = '';
      if (relevantHistory.length > 0) {
        conversationContext = relevantHistory.map(msg => {
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          return `${role}: ${msg.content}`;
        }).join('\n\n');
      }
      
      // Combine system prompt with conversation context
      if (defaultSystemPrompt && conversationContext) {
        systemPrompt = `${defaultSystemPrompt}\n\nPrevious conversation:\n${conversationContext}`;
      } else if (defaultSystemPrompt) {
        systemPrompt = defaultSystemPrompt;
      } else if (conversationContext) {
        systemPrompt = `You are a helpful AI assistant. Here's our conversation so far:\n${conversationContext}`;
      }
      
      // Add current context instruction
      const contextualPrompt = relevantHistory.length > 0 
        ? `Continue this conversation naturally, referring to previous messages when relevant:\n\n${prompt}`
        : prompt;

      // Prepare generation options
      const options: GenerationOptions = {
        model: selectedModelId,
        prompt: contextualPrompt,
        system: systemPrompt.length > 0 ? systemPrompt : undefined,
        options: {
          ...modelConfig.parameters
        },
        stream: settings.chatSettings.streamResponses
      };
      
      console.log('🚀 Generation options:', options);
      
      // Make the API call
      console.log('📡 Calling Ollama API...');
      const response = await ollamaService.generateCompletion(options);
      console.log('📬 Response received:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Generation failed:', errorText);
        throw new Error(`Generation failed: ${errorText}`);
      }
      
      // Handle streaming and non-streaming responses differently
      if (settings.chatSettings.streamResponses) {
        console.log('🌊 Processing streaming response...');
        // For streaming responses, we need to handle the response as a stream of data
        const reader = response.body?.getReader();
        let responseText = '';
        
        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = new TextDecoder().decode(value);
              console.log('📥 Received chunk:', chunk);
              
              // Process each line as a separate JSON object
              const lines = chunk.split('\n').filter(line => line.trim());
              
              for (const line of lines) {
                try {
                  const data = JSON.parse(line);
                  if (data.response) {
                    responseText += data.response;
                  }
                  if (data.done) {
                    console.log('✅ Streaming complete. Final response:', responseText);
                  }
                } catch (e) {
                  console.warn('⚠️ Error parsing chunk:', e);
                }
              }
            }
            
            return responseText;
          } catch (e) {
            console.error('❌ Error reading stream:', e);
            throw e;
          }
        } else {
          throw new Error('Could not get reader from response');
        }
      } else {
        console.log('📄 Processing non-streaming response...');
        // For non-streaming responses, parse the response as a single JSON object
        try {
          const result = await response.json();
          console.log('✅ Non-streaming response:', result);
          return result.response;
        } catch (e: unknown) {
          console.error('❌ Error parsing JSON response:', e);
          // Try to read as text if JSON parsing fails
          const text = await response.text();
          console.warn('📝 Response as text:', text);
          throw new Error(`Failed to parse JSON response: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    } catch (error) {
      console.error('Error generating response:', error);
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return "An unknown error occurred while generating a response.";
    }
  }
}
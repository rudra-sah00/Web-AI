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
      // Get app settings and current model from config
      const settings = configService.getSettings();
      // Look for the model in the proper location according to AppSettings interface
      const selectedModelId = settings.defaultModel;
      
      if (!selectedModelId) {
        throw new Error("No model selected. Please select a model in Settings.");
      }

      // Get model parameters if configured
      const modelConfig = configService.getModelConfig(selectedModelId);
      if (!modelConfig) {
        throw new Error(`Model configuration for ${selectedModelId} not found.`);
      }

      // Check if Ollama service is running
      const status = await ollamaService.checkOllamaStatus();
      if (status.status === 'error') {
        throw new Error(`Ollama service error: ${status.message}`);
      }

      // Build context from chat history (last few messages)
      const relevantHistory = chatHistory.slice(-6); // Take last 6 messages for context
      
      // Get default system prompt from settings
      let systemPrompt = '';
      const displaySettings = typeof window !== 'undefined' ? localStorage.getItem('chatDisplaySettings') : null;
      let defaultSystemPrompt = '';
      if (displaySettings) {
        const settings = JSON.parse(displaySettings);
        defaultSystemPrompt = settings.defaultSystemPrompt || '';
      }
      
      // Format messages for context
      if (relevantHistory.length > 0) {
        systemPrompt = relevantHistory.map(msg => 
          `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
        ).join('\n\n');
        // Prepend default system prompt if it exists
        if (defaultSystemPrompt) {
          systemPrompt = defaultSystemPrompt + '\n\n' + systemPrompt;
        }
      } else if (defaultSystemPrompt) {
        // Use default system prompt for new conversations
        systemPrompt = defaultSystemPrompt;
      }

      // Prepare generation options
      const options: GenerationOptions = {
        model: selectedModelId,
        prompt: prompt,
        system: systemPrompt.length > 0 ? systemPrompt : undefined,
        options: {
          ...modelConfig.parameters
        },
        stream: settings.chatSettings.streamResponses
      };
      
      // Make the API call
      const response = await ollamaService.generateCompletion(options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Generation failed: ${errorText}`);
      }
      
      // Handle streaming and non-streaming responses differently
      if (settings.chatSettings.streamResponses) {
        // For streaming responses, we need to handle the response as a stream of data
        const reader = response.body?.getReader();
        let responseText = '';
        
        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = new TextDecoder().decode(value);
              
              // Process each line as a separate JSON object
              const lines = chunk.split('\n').filter(line => line.trim());
              
              for (const line of lines) {
                try {
                  const data = JSON.parse(line);
                  if (data.response) {
                    responseText += data.response;
                  }
                } catch (e) {
                  console.warn('Error parsing chunk:', e);
                }
              }
            }
            
            return responseText;
          } catch (e) {
            console.error('Error reading stream:', e);
            throw e;
          }
        } else {
          throw new Error('Could not get reader from response');
        }
      } else {
        // For non-streaming responses, parse the response as a single JSON object
        try {
          const result = await response.json();
          return result.response;
        } catch (e: unknown) {
          console.error('Error parsing JSON response:', e);
          // Try to read as text if JSON parsing fails
          const text = await response.text();
          console.warn('Response as text:', text);
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
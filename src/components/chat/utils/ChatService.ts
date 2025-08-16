import { Chat, Message } from "../components/types";
import ollamaService from '@/services/OllamaService';
import configService from '@/services/ConfigService';
import modelSettingsService from '@/services/ModelSettingsService';
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

      // Trigger sidebar update for real-time chat list updates
      if (typeof window !== 'undefined') {
        // Trigger custom event
        window.dispatchEvent(new Event('chatUpdated'));
        
        // Also call global function if available
        if ((window as any).triggerSidebarUpdate) {
          (window as any).triggerSidebarUpdate();
        }
        
        // Set localStorage flag for cross-tab updates
        localStorage.setItem('chatUpdated', Date.now().toString());
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

      // Trigger sidebar update for real-time message count updates
      if (typeof window !== 'undefined') {
        // Trigger custom event
        window.dispatchEvent(new Event('chatUpdated'));
        
        // Also call global function if available
        if ((window as any).triggerSidebarUpdate) {
          (window as any).triggerSidebarUpdate();
        }
        
        // Set localStorage flag for cross-tab updates
        localStorage.setItem('chatUpdated', Date.now().toString());
      }

      return true;
    } catch (error) {
      console.error('Error saving chat:', error);
      throw new Error('Network error while saving');
    }
  }

  /**
   * Generate a streaming response using the selected Ollama model
   * @param prompt - The user's prompt
   * @param chatHistory - Previous conversation messages
   * @param onChunk - Callback function to handle each streaming chunk
   * @returns Promise that resolves when streaming is complete
   */
  static async generateStreamingResponse(
    prompt: string, 
    chatHistory: Message[] = [], 
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      console.log('🤖 Starting AI streaming response generation...');
      
      // Get model settings from ModelSettingsService
      const modelSettings = modelSettingsService.getSettings();
      console.log('🎯 Model settings loaded:', modelSettings);
      
      const selectedModelId = modelSettings.defaultModel;
      console.log('🎯 Selected model ID:', selectedModelId);
      
      if (!selectedModelId || selectedModelId.trim() === '') {
        throw new Error("Please select a model first! Go to Settings → Model Selection to choose a model before starting a chat.");
      }

      // Get model parameters if configured
      const modelConfig = configService.getModelConfig(selectedModelId);
      console.log('📋 Model config:', modelConfig);
      
      let modelConfigToUse;
      if (!modelConfig) {
        // If no specific config found, create a default one
        modelConfigToUse = {
          id: selectedModelId,
          name: selectedModelId,
          description: "Selected model",
          parameters: {
            temperature: modelSettings.defaultTemperature,
            top_p: modelSettings.defaultTopP,
            max_tokens: modelSettings.defaultMaxTokens
          },
          installed: true
        };
        console.log('📋 Using default model config:', modelConfigToUse);
      } else {
        modelConfigToUse = modelConfig;
      }

      // Check if Ollama service is running
      console.log('🔍 Checking status...');
      const status = await ollamaService.checkOllamaStatus();
      console.log('📊 Service status:', status);
      
      if (status.status === 'error') {
        throw new Error(`Service error: ${status.message}`);
      }

      // Build intelligent context from chat history
      const contextLimit = 15; // Use last 15 messages for better context
      const relevantHistory = chatHistory.slice(-contextLimit);
      
      // Get default system prompt from settings
      let systemPrompt = '';
      const displaySettings = typeof window !== 'undefined' ? localStorage.getItem('chatDisplaySettings') : null;
      let defaultSystemPrompt = '';
      if (displaySettings) {
        const settings = JSON.parse(displaySettings);
        defaultSystemPrompt = settings.defaultSystemPrompt || '';
      }
      
      // Enhanced context intelligence - analyze conversation for smart continuity
      let conversationContext = '';
      let contextualInstructions = '';
      
      if (relevantHistory.length > 0) {
        // Format conversation history
        conversationContext = relevantHistory.map(msg => {
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          return `${role}: ${msg.content}`;
        }).join('\n\n');
        
        // Analyze recent conversation for smart context hints
        const recentMessages = relevantHistory.slice(-5); // Last 5 messages for immediate context
        const hasCodeContext = recentMessages.some(msg => 
          msg.content.includes('```') || 
          msg.content.toLowerCase().includes('code') ||
          msg.content.toLowerCase().includes('program') ||
          msg.content.toLowerCase().includes('function') ||
          msg.content.toLowerCase().includes('write') && (
            msg.content.toLowerCase().includes('python') ||
            msg.content.toLowerCase().includes('java') ||
            msg.content.toLowerCase().includes('javascript') ||
            msg.content.toLowerCase().includes('html') ||
            msg.content.toLowerCase().includes('css') ||
            msg.content.toLowerCase().includes('react') ||
            msg.content.toLowerCase().includes('node')
          )
        );
        
        const hasQuestionContext = recentMessages.some(msg => 
          msg.content.includes('?') || 
          msg.content.toLowerCase().startsWith('what') ||
          msg.content.toLowerCase().startsWith('how') ||
          msg.content.toLowerCase().startsWith('why') ||
          msg.content.toLowerCase().startsWith('when') ||
          msg.content.toLowerCase().startsWith('where')
        );
        
        // Build smart contextual instructions
        if (hasCodeContext) {
          contextualInstructions = `\n\nIMPORTANT CONTEXT: This conversation involves coding/programming. When the user refers to "that", "it", "this", or similar pronouns, they likely mean the code, program, function, or technical concept from the previous messages. Be smart about inferring what they're referring to and maintain continuity.`;
        } else if (hasQuestionContext) {
          contextualInstructions = `\n\nIMPORTANT CONTEXT: This conversation involves questions and answers. When the user asks follow-up questions or refers to "that", "it", "this", they likely mean the topic or answer from previous messages. Maintain conversational continuity.`;
        } else {
          contextualInstructions = `\n\nIMPORTANT CONTEXT: Maintain natural conversation flow. When the user refers to "that", "it", "this", or uses pronouns, intelligently infer what they mean based on our recent conversation history.`;
        }
      }
      
      // Enhanced system prompt with smart context
      const enhancedSystemPrompt = `You are a highly intelligent AI assistant. You excel at understanding context and maintaining conversation continuity like ChatGPT.

Key abilities:
- When users refer to "that", "it", "this", "the one", etc., you intelligently understand what they mean from our conversation
- You maintain perfect context awareness across the entire conversation
- You can seamlessly continue topics, modify code, answer follow-ups, and build upon previous responses
- You're proactive in understanding implied references and context

${defaultSystemPrompt ? `Additional instructions: ${defaultSystemPrompt}` : ''}${contextualInstructions}`;
      
      // Combine system prompt with conversation context
      if (conversationContext) {
        systemPrompt = `${enhancedSystemPrompt}\n\nPrevious conversation:\n${conversationContext}`;
      } else {
        systemPrompt = enhancedSystemPrompt;
      }
      
      // Smart contextual prompt that helps AI understand references
      const contextualPrompt = relevantHistory.length > 0 
        ? `[CONVERSATION CONTEXT: Analyze the conversation history above and understand any references in this message]

${prompt}

[INSTRUCTION: If this message refers to something from our previous conversation (using words like "that", "it", "this", "the one", etc.), identify what it refers to and respond accordingly. Be smart about context.]`
        : prompt;

      // Prepare generation options - force streaming for this method
      const options: GenerationOptions = {
        model: selectedModelId,
        prompt: contextualPrompt,
        system: systemPrompt.length > 0 ? systemPrompt : undefined,
        options: {
          ...modelConfigToUse.parameters
        },
        stream: true // Always stream for this method
      };
      
      console.log('🚀 Generation options:', options);
      
      // Make the API call
      console.log('📡 Calling API...');
      const response = await ollamaService.generateCompletion(options);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Generation failed:', errorText);
        throw new Error(`Generation failed: ${errorText}`);
      }
      
      // Handle streaming response
      console.log('🌊 Processing streaming response...');
      const reader = response.body?.getReader();
      
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
                  onChunk(data.response); // Stream each chunk to the UI
                }
                if (data.done) {
                  console.log('✅ Streaming complete');
                  return;
                }
              } catch (e) {
                console.warn('⚠️ Error parsing chunk:', e);
              }
            }
          }
        } catch (e) {
          console.error('❌ Error reading stream:', e);
          throw e;
        }
      } else {
        throw new Error('Could not get reader from response');
      }
    } catch (error) {
      console.error('Error generating streaming response:', error);
      if (error instanceof Error) {
        onChunk(`Error: ${error.message}`);
      } else {
        onChunk("An unknown error occurred while generating a response.");
      }
    }
  }

  /**
   * Generate a response using the selected Ollama model
   * @returns Promise that resolves to the generated text or error message
   */
  static async generateResponse(prompt: string, chatHistory: Message[] = []): Promise<string> {
    try {
      console.log('🤖 Starting AI response generation...');
      
      // Get model settings from ModelSettingsService
      const modelSettings = modelSettingsService.getSettings();
      console.log('🎯 Model settings loaded:', modelSettings);
      
      const selectedModelId = modelSettings.defaultModel;
      console.log('🎯 Selected model ID:', selectedModelId);
      
      if (!selectedModelId || selectedModelId.trim() === '') {
        throw new Error("Please select a model first! Go to Settings → Model Selection to choose a model before starting a chat.");
      }

      // Get model parameters if configured
      const modelConfig = configService.getModelConfig(selectedModelId);
      console.log('📋 Model config:', modelConfig);
      
      let modelConfigToUse;
      if (!modelConfig) {
        // If no specific config found, create a default one
        modelConfigToUse = {
          id: selectedModelId,
          name: selectedModelId,
          description: "Selected model",
          parameters: {
            temperature: modelSettings.defaultTemperature,
            top_p: modelSettings.defaultTopP,
            max_tokens: modelSettings.defaultMaxTokens
          },
          installed: true
        };
        console.log('📋 Using default model config:', modelConfigToUse);
      } else {
        modelConfigToUse = modelConfig;
      }

      // Get chat settings for streaming preference
      const settings = configService.getSettings();

      // Check if Ollama service is running
      console.log('🔍 Checking Ollama status...');
      const status = await ollamaService.checkOllamaStatus();
      console.log('📊 Ollama status:', status);
      
      if (status.status === 'error') {
        throw new Error(`Ollama service error: ${status.message}`);
      }

      // Build intelligent context from chat history
      const contextLimit = 15; // Use last 15 messages for better context
      const relevantHistory = chatHistory.slice(-contextLimit);
      
      // Get default system prompt from settings
      let systemPrompt = '';
      const displaySettings = typeof window !== 'undefined' ? localStorage.getItem('chatDisplaySettings') : null;
      let defaultSystemPrompt = '';
      if (displaySettings) {
        const settings = JSON.parse(displaySettings);
        defaultSystemPrompt = settings.defaultSystemPrompt || '';
      }
      
      // Enhanced context intelligence - analyze conversation for smart continuity
      let conversationContext = '';
      let contextualInstructions = '';
      
      if (relevantHistory.length > 0) {
        // Format conversation history
        conversationContext = relevantHistory.map(msg => {
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          return `${role}: ${msg.content}`;
        }).join('\n\n');
        
        // Analyze recent conversation for smart context hints
        const recentMessages = relevantHistory.slice(-5); // Last 5 messages for immediate context
        const hasCodeContext = recentMessages.some(msg => 
          msg.content.includes('```') || 
          msg.content.toLowerCase().includes('code') ||
          msg.content.toLowerCase().includes('program') ||
          msg.content.toLowerCase().includes('function') ||
          msg.content.toLowerCase().includes('write') && (
            msg.content.toLowerCase().includes('python') ||
            msg.content.toLowerCase().includes('java') ||
            msg.content.toLowerCase().includes('javascript') ||
            msg.content.toLowerCase().includes('html') ||
            msg.content.toLowerCase().includes('css') ||
            msg.content.toLowerCase().includes('react') ||
            msg.content.toLowerCase().includes('node')
          )
        );
        
        const hasQuestionContext = recentMessages.some(msg => 
          msg.content.includes('?') || 
          msg.content.toLowerCase().startsWith('what') ||
          msg.content.toLowerCase().startsWith('how') ||
          msg.content.toLowerCase().startsWith('why') ||
          msg.content.toLowerCase().startsWith('when') ||
          msg.content.toLowerCase().startsWith('where')
        );
        
        // Build smart contextual instructions
        if (hasCodeContext) {
          contextualInstructions = `\n\nIMPORTANT CONTEXT: This conversation involves coding/programming. When the user refers to "that", "it", "this", or similar pronouns, they likely mean the code, program, function, or technical concept from the previous messages. Be smart about inferring what they're referring to and maintain continuity.`;
        } else if (hasQuestionContext) {
          contextualInstructions = `\n\nIMPORTANT CONTEXT: This conversation involves questions and answers. When the user asks follow-up questions or refers to "that", "it", "this", they likely mean the topic or answer from previous messages. Maintain conversational continuity.`;
        } else {
          contextualInstructions = `\n\nIMPORTANT CONTEXT: Maintain natural conversation flow. When the user refers to "that", "it", "this", or uses pronouns, intelligently infer what they mean based on our recent conversation history.`;
        }
      }
      
      // Enhanced system prompt with smart context
      const enhancedSystemPrompt = `You are a highly intelligent AI assistant. You excel at understanding context and maintaining conversation continuity like ChatGPT.

Key abilities:
- When users refer to "that", "it", "this", "the one", etc., you intelligently understand what they mean from our conversation
- You maintain perfect context awareness across the entire conversation
- You can seamlessly continue topics, modify code, answer follow-ups, and build upon previous responses
- You're proactive in understanding implied references and context

${defaultSystemPrompt ? `Additional instructions: ${defaultSystemPrompt}` : ''}${contextualInstructions}`;
      
      // Combine system prompt with conversation context
      if (conversationContext) {
        systemPrompt = `${enhancedSystemPrompt}\n\nPrevious conversation:\n${conversationContext}`;
      } else {
        systemPrompt = enhancedSystemPrompt;
      }
      
      // Smart contextual prompt that helps AI understand references
      const contextualPrompt = relevantHistory.length > 0 
        ? `[CONVERSATION CONTEXT: Analyze the conversation history above and understand any references in this message]

${prompt}

[INSTRUCTION: If this message refers to something from our previous conversation (using words like "that", "it", "this", "the one", etc.), identify what it refers to and respond accordingly. Be smart about context.]`
        : prompt;

      // Prepare generation options
      const options: GenerationOptions = {
        model: selectedModelId,
        prompt: contextualPrompt,
        system: systemPrompt.length > 0 ? systemPrompt : undefined,
        options: {
          ...modelConfigToUse.parameters
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
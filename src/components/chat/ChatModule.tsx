"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, MessageSquare, Cpu, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Import our modular components
import MessageItem from "./components/MessageItem";
import MessageInput from "./components/MessageInput";
import PromptTemplates from "./components/PromptTemplates";

// Import types and service
import { Chat, Message } from "./components/types";
import { ChatService } from "./utils/ChatService";
import modelSettingsService from "@/services/ModelSettingsService";

interface ChatModuleProps {
  sidebarCollapsed: boolean;
  selectedChatId?: string;
  onChatUpdate?: (chat: Chat) => void;
  onMessageSent?: () => void; // Callback for when a message is sent
}

export default function ChatModule({ 
  sidebarCollapsed, 
  selectedChatId, 
  onChatUpdate,
  onMessageSent 
}: ChatModuleProps) {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasSelectedModel, setHasSelectedModel] = useState<boolean>(false); // Start with false until checked
  const [isCheckingModel, setIsCheckingModel] = useState<boolean>(true); // Add loading state for model check
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if a model is selected
  const checkModelSelection = async () => {
    try {
      setIsCheckingModel(true);
      // Small delay to ensure services are properly initialized
      await new Promise(resolve => setTimeout(resolve, 100));
      const modelSettings = await modelSettingsService.getSettingsAsync();
      const isModelSelected = Boolean(modelSettings.defaultModel && modelSettings.defaultModel.trim() !== "");
      console.log('🔍 Model selection check:', {
        defaultModel: modelSettings.defaultModel,
        isModelSelected
      });
      setHasSelectedModel(isModelSelected);
      return isModelSelected;
    } catch (error) {
      console.error('Error checking model selection:', error);
      setHasSelectedModel(false);
      return false;
    } finally {
      setIsCheckingModel(false);
    }
  };

  // Check model selection on mount and when config changes
  useEffect(() => {
    // Initial check
    const initCheck = async () => {
      await checkModelSelection();
    };
    initCheck();
    
    // Listen for window focus to refresh model selection state
    const handleFocus = async () => {
      await checkModelSelection();
    };
    
    // Listen for model change events
    const handleModelChange = async (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log(`🎯 Model changed event received: ${customEvent.detail}`);
      await checkModelSelection();
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('modelChanged', handleModelChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('modelChanged', handleModelChange);
    };
  }, []);

  // Load chat data when selectedChatId changes
  useEffect(() => {
    if (selectedChatId) {
      fetchChat(selectedChatId);
    } else {
      setCurrentChat(null);
    }
  }, [selectedChatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch chat data from API
  const fetchChat = async (chatId: string) => {
    setIsLoading(true);
    setSaveError(null);
    
    try {
      const chat = await ChatService.fetchChat(chatId);
      
      if (chat) {
        setCurrentChat(chat);
      } else {
        // If chat doesn't exist, create a new one
        const newChat: Chat = {
          id: chatId,
          title: `New Chat`,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setCurrentChat(newChat);
        
        // Create the new chat
        await ChatService.createChat(newChat);
      }
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError('Failed to load chat');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    setSaveError(null);
    
    // Check if a model is selected before proceeding
    if (!checkModelSelection()) {
      setSaveError("Please select a model first! Go to Settings → Models to choose a model before starting a chat.");
      return;
    }
    
    setIsLoading(true);
    setIsGenerating(true);

    try {
      // If no chat is selected, create a new one automatically
      let chatToUpdate = currentChat;
      
      if (!chatToUpdate) {
        const newChatId = Date.now().toString();
        chatToUpdate = {
          id: newChatId,
          title: messageText.slice(0, 30) + (messageText.length > 30 ? "..." : ""),
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Create the new chat first
        await ChatService.createChat(chatToUpdate);
        setCurrentChat(chatToUpdate);
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: new Date().toISOString()
      };
      
      // First update the UI with just the user message
      let updatedChat: Chat = {
        ...chatToUpdate,
        messages: [...chatToUpdate.messages, newMessage],
        updatedAt: new Date().toISOString()
      };

      // Update title if it's the first message
      if (chatToUpdate.messages.length === 0) {
        updatedChat.title = messageText.slice(0, 30) + (messageText.length > 30 ? "..." : "");
      }

      setCurrentChat(updatedChat);
      await ChatService.updateChat(updatedChat);
      
      // Notify parent component about the chat creation/update for sidebar refresh
      if (onChatUpdate) {
        onChatUpdate(updatedChat);
      }
      
      // Generate AI response using streaming
      setIsGenerating(true);
      setStreamingMessage('');
      const streamingId = (Date.now() + 1).toString();
      setStreamingMessageId(streamingId);
      
      let fullResponse = '';
      
      await ChatService.generateStreamingResponse(
        messageText, 
        updatedChat.messages,
        (chunk: string) => {
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
        }
      );
      
      // Create final AI response message
      const aiResponse: Message = {
        id: streamingId,
        role: "assistant",
        content: fullResponse,
        timestamp: new Date().toISOString()
      };

      // Update with final AI response
      updatedChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiResponse],
        updatedAt: new Date().toISOString()
      };

      setCurrentChat(updatedChat);

      // Save the updated chat with the AI response
      await ChatService.updateChat(updatedChat);
      
      // Notify parent component about the update
      if (onChatUpdate) {
        onChatUpdate(updatedChat);
      }
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError('Failed to send message or generate response');
      }
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
      setStreamingMessage('');
      setStreamingMessageId(null);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!currentChat) return;
    setSaveError(null);
    
    try {
      // Find the message index
      const msgIndex = currentChat.messages.findIndex(m => m.id === messageId);
      if (msgIndex === -1) return;

      // Create a new array with the edited message
      const updatedMessages = [...currentChat.messages];
      updatedMessages[msgIndex] = {
        ...updatedMessages[msgIndex],
        content: newContent
      };

      const updatedChat = {
        ...currentChat,
        messages: updatedMessages,
        updatedAt: new Date().toISOString()
      };

      setCurrentChat(updatedChat);
      
      // Save changes to server
      await ChatService.updateChat(updatedChat);
      
      // Notify parent component about the update
      if (onChatUpdate) {
        onChatUpdate(updatedChat);
      }
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError('Failed to edit message');
      }
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentChat) return;
    setSaveError(null);
    
    try {
      // Find the message index
      const msgIndex = currentChat.messages.findIndex(m => m.id === messageId);
      if (msgIndex === -1) return;
      
      // If it's a user message, remove it and the assistant's response that follows
      let messagesToRemove = 1;
      if (currentChat.messages[msgIndex].role === "user" && 
          msgIndex + 1 < currentChat.messages.length && 
          currentChat.messages[msgIndex + 1].role === "assistant") {
        messagesToRemove = 2;
      }
      
      const updatedMessages = [
        ...currentChat.messages.slice(0, msgIndex),
        ...currentChat.messages.slice(msgIndex + messagesToRemove)
      ];

      const updatedChat = {
        ...currentChat,
        messages: updatedMessages,
        updatedAt: new Date().toISOString()
      };

      setCurrentChat(updatedChat);
      
      // Save changes to server
      await ChatService.updateChat(updatedChat);
      
      // Notify parent component about the update
      if (onChatUpdate) {
        onChatUpdate(updatedChat);
      }
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError('Failed to delete message');
      }
    }
  };

  const handleClearChat = async () => {
    if (!currentChat) return;
    setSaveError(null);
    
    try {
      const clearedChat: Chat = {
        ...currentChat,
        messages: [],
        updatedAt: new Date().toISOString()
      };
      
      setCurrentChat(clearedChat);
      
      // Save changes to server
      await ChatService.updateChat(clearedChat);
      
      // Notify parent component about the update
      if (onChatUpdate) {
        onChatUpdate(clearedChat);
      }
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError('Failed to clear chat');
      }
    }
  };

  const handlePromptSelect = (promptText: string) => {
    handleSendMessage(promptText);
  };

  // Loading screen component
  const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="text-center space-y-6">
        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20">
            <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        </div>
        
        {/* Loading message */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            Loading AI Assistant...
          </h3>
          <p className="text-muted-foreground">
            Initializing models and settings
          </p>
        </div>
      </div>
    </div>
  );

  // Model selection prompt component
  const ModelSelectionPrompt = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 max-w-4xl mx-auto">
      <div className="text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-orange-100 dark:bg-orange-900/20">
            <AlertCircle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        
        {/* Main message */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Select a Model to Start Chatting
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            To begin a conversation, please select an AI model first. You can choose from available models in the settings.
          </p>
        </div>
        
        {/* Action button */}
        <div className="pt-4">
          <Link href="/models">
            <Button className="flex items-center gap-2 px-6 py-3 text-base">
              <Settings className="h-5 w-5" />
              Go to Model Settings
            </Button>
          </Link>
        </div>
        
        {/* Additional info */}
        <div className="text-sm text-muted-foreground max-w-lg mx-auto">
          <p>
            💡 <strong>Tip:</strong> You can install and manage different AI models like Llama, Mistral, or CodeLlama 
            based on your needs. Each model has different capabilities and performance characteristics.
          </p>
        </div>
      </div>
    </div>
  );

  // Welcome screen component
  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 max-w-4xl mx-auto">
      {/* Help message above input */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-medium text-foreground">
          How can I help you?
        </h2>
      </div>
      
      {/* Message Input in the center */}
      <div className="w-full">
        <MessageInput 
          onSendMessage={handleSendMessage}
          isLoading={isGenerating}
          disabled={!hasSelectedModel}
          placeholder={!hasSelectedModel ? "Please select a model first to start chatting..." : undefined}
          onMessageSend={onMessageSent}
          showBorder={false}
        />
      </div>
    </div>
  );

  // Show ModelSelectionPrompt or WelcomeScreen when no chat exists or current chat has no messages
  if (!currentChat || (currentChat && currentChat.messages.length === 0)) {
    return (
      <div 
        className={`flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out bg-background ${
          sidebarCollapsed ? "ml-16" : "ml-0 md:ml-72"
        }`}
      >
        <div className="flex-1 overflow-y-auto bg-background animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isCheckingModel ? (
            <LoadingScreen />
          ) : !hasSelectedModel ? (
            <ModelSelectionPrompt />
          ) : (
            <WelcomeScreen />
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out bg-background animate-in fade-in slide-in-from-bottom-4 duration-500 ${
        sidebarCollapsed ? "ml-16" : "ml-0 md:ml-72"
      }`}
    >
      {/* Messages container with proper scrolling */}
      <div className="flex-1 overflow-y-auto bg-background min-h-0">
        {isLoading && !currentChat?.messages.length ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin transition-transform duration-300 group-hover:scale-110 text-white" />
          </div>
        ) : (
          <div className="min-h-full">
            {saveError && (
              <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="bg-red-600/20 text-red-400 p-3 rounded-md border border-red-600/30">
                  {saveError}
                </div>
              </div>
            )}
            
            {/* Show prompt templates when chat is empty */}
            {currentChat?.messages.length === 0 ? (
              <div className="max-w-4xl mx-auto px-4 py-8">
                <PromptTemplates onSelectPrompt={handlePromptSelect} />
              </div>
            ) : (
              <>
                {currentChat?.messages.map((message) => (
                  <MessageItem 
                    key={message.id} 
                    message={message}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                  />
                ))}
                
                {/* Show loading indicator when generating a response */}
                {isGenerating && (
                  <div className="w-full py-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="max-w-4xl mx-auto px-4">
                      <div className="flex items-start gap-4">
                        {streamingMessage ? (
                          <>
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                              <Loader2 className="h-4 w-4 text-white animate-spin" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                {streamingMessage}
                                <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1"></span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 ml-12">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input component */}
      <div className="flex-shrink-0 transition-all duration-300 ease-in-out">
        <MessageInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={isGenerating || !hasSelectedModel}
          placeholder={!hasSelectedModel ? "Please select a model first to start chatting..." : undefined}
          onMessageSend={onMessageSent}
        />
      </div>
    </div>
  );
}
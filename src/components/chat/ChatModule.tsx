"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

// Import our modular components
import ChatHeader from "./components/ChatHeader";
import MessageItem from "./components/MessageItem";
import MessageInput from "./components/MessageInput";
import PromptTemplates from "./components/PromptTemplates";

// Import types and service
import { Chat, Message } from "./components/types";
import { ChatService } from "./utils/ChatService";

interface ChatModuleProps {
  sidebarCollapsed: boolean;
  selectedChatId?: string;
  onChatUpdate?: (chat: Chat) => void;
}

export default function ChatModule({ 
  sidebarCollapsed, 
  selectedChatId, 
  onChatUpdate 
}: ChatModuleProps) {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (!currentChat) return;
    setSaveError(null);
    setIsLoading(true);
    setIsGenerating(true);

    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: new Date().toISOString()
      };
      
      // First update the UI with just the user message
      let updatedChat: Chat = {
        ...currentChat,
        messages: [...currentChat.messages, newMessage],
        updatedAt: new Date().toISOString()
      };

      // Update title if it's the first message
      if (currentChat.messages.length === 0) {
        updatedChat.title = messageText.slice(0, 30) + (messageText.length > 30 ? "..." : "");
      }

      setCurrentChat(updatedChat);
      await ChatService.updateChat(updatedChat);
      
      // Generate AI response using the selected Ollama model
      const aiResponseText = await ChatService.generateResponse(
        messageText, 
        updatedChat.messages
      );
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponseText,
        timestamp: new Date().toISOString()
      };

      // Update with AI response
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

  if (!selectedChatId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to Ollama AI Chat</h2>
          <p className="text-muted-foreground mb-6">Select a chat from the sidebar or create a new one to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col h-full transition-all duration-200 ${
        sidebarCollapsed ? "ml-16" : "ml-0 md:ml-64"
      }`}
    >
      {/* Chat header component */}
      <ChatHeader 
        title={currentChat?.title || "New Chat"}
        hasMessages={Boolean(currentChat?.messages.length)}
        onClearChat={handleClearChat}
      />

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && !currentChat?.messages.length ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin transition-transform duration-300 group-hover:scale-110" />
          </div>
        ) : (
          <>
            {saveError && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
                {saveError}
              </div>
            )}
            
            {/* Show prompt templates when chat is empty */}
            {currentChat?.messages.length === 0 ? (
              <PromptTemplates onSelectPrompt={handlePromptSelect} />
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
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="text-muted-foreground">Generating response...</div>
                  </div>
                )}
              </>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input component */}
      <MessageInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={isGenerating}
      />
    </div>
  );
}
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import modelSettingsService from "@/services/ModelSettingsService";
import { 
  Send, 
  Loader2, 
  Mic, 
  MicOff, 
  Globe, 
  Paperclip,
  Code,
  Bold,
  Italic,
  AlertCircle
} from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  onMessageSend?: () => void; // Callback for when a message is sent
  showBorder?: boolean; // Whether to show the input border
  placeholder?: string; // Custom placeholder text
}

export default function MessageInput({ onSendMessage, isLoading, disabled = false, onMessageSend, showBorder = true, placeholder }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [showFormatting, setShowFormatting] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [hasSelectedModel, setHasSelectedModel] = useState<boolean>(false); // Start with false, will be updated after async check
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = isLoading || disabled;

  // Initialize speech recognition
  useEffect(() => {
    // Check if model is selected
    const checkModelSelection = async () => {
      try {
        const modelSettings = await modelSettingsService.getSettingsAsync();
        const isModelSelected = Boolean(modelSettings.defaultModel && modelSettings.defaultModel.trim() !== "");
        console.log(`🎯 MessageInput model selection check: ${isModelSelected ? 'YES' : 'NO'} (model: ${modelSettings.defaultModel})`);
        setHasSelectedModel(isModelSelected);
        return isModelSelected;
      } catch (error) {
        console.error('Error checking model selection in MessageInput:', error);
        setHasSelectedModel(false);
        return false;
      }
    };

    // Initial check
    const initCheck = async () => {
      // Small delay to ensure services are properly initialized
      await new Promise(resolve => setTimeout(resolve, 100));
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
      console.log(`🎯 MessageInput received model change event: ${customEvent.detail}`);
      await checkModelSelection();
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('modelChanged', handleModelChange);

    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setMessage((prev) => transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setSpeechRecognition(recognition);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('modelChanged', handleModelChange);
      if (speechRecognition) {
        speechRecognition.stop();
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || isLoading) return;
    
    // Check if model is selected before sending
    if (!hasSelectedModel) {
      console.warn('No model selected - message sending blocked');
      return;
    }
    
    // Prepare the final message
    let finalMessage = message;
    
    // Add web search prefix if enabled
    if (webSearchEnabled) {
      finalMessage = `[WEB SEARCH] ${message}`;
      setWebSearchEnabled(false); // Reset web search after sending
    }
    
    onSendMessage(finalMessage);
    setMessage("");
    
    // Call the optional callback when message is sent
    if (onMessageSend) {
      onMessageSend();
    }
  };

  // Handle voice input toggle
  const toggleListening = () => {
    if (isDisabled) return;
    
    if (!speechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechRecognition.start();
      
      // Focus the textarea
      setTimeout(() => {
        document.querySelector('textarea')?.focus();
      }, 100);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileSize = (file.size / 1024 / 1024).toFixed(2); // Size in MB
    
    // Add file info to message input
    setMessage((prev) => 
      prev + `\n\n[File attached: ${file.name} (${fileSize} MB)]\n`
    );
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle web search toggle
  const toggleWebSearch = () => {
    if (isDisabled) return;
    setWebSearchEnabled(!webSearchEnabled);
  };

  // Format text functions
  const insertFormatting = (before: string, after: string = '') => {
    if (isDisabled || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    
    const newText = message.substring(0, start) + before + selectedText + after + message.substring(end);
    setMessage(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertBold = () => {
    insertFormatting('**', '**');
  };

  const insertItalic = () => {
    insertFormatting('*', '*');
  };

  const insertInlineCode = () => {
    insertFormatting('`', '`');
  };

  return (
    <>
      {/* Formatting toolbar - compact */}
      {showFormatting && (
        <div className="max-w-3xl mx-auto px-4 mb-2">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={insertBold}
                className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Bold (**text**)"
              >
                <Bold className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={insertItalic}
                className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Italic (*text*)"
              >
                <Italic className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={insertInlineCode}
                className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Inline code (`code`)"
              >
                <Code className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Shift+Enter for new line
            </div>
          </div>
        </div>
      )}

      {/* Input area - curved edges only */}
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className={cn(
          "flex items-end gap-2 p-3 rounded-3xl bg-muted/50 border border-border transition-all duration-300 ease-in-out",
          isDisabled && "opacity-70"
        )}>
          {/* Action buttons - left side */}
          <div className="flex items-center gap-1 pb-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
              title={isListening ? "Stop recording" : "Voice input"}
              onClick={toggleListening}
              disabled={isDisabled}
            >
              {isListening ? (
                <MicOff className="h-3 w-3 text-destructive" />
              ) : (
                <Mic className="h-3 w-3" />
              )}
            </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 w-7 p-0 rounded-md transition-colors",
                  webSearchEnabled 
                    ? "bg-green-600 text-white hover:bg-green-700" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
                title={webSearchEnabled ? "Web search enabled - click to disable" : "Enable web search"}
                onClick={toggleWebSearch}
                disabled={isDisabled}
              >
                <Globe className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Attach file"
                onClick={() => !isDisabled && fileInputRef.current?.click()}
                disabled={isDisabled}
              >
                <Paperclip className="h-3 w-3" />
              </Button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                disabled={isDisabled}
              />
            </div>

            {/* Text input */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  placeholder ||
                  (!hasSelectedModel
                    ? "Please select a model in Settings → Model Selection to start chatting"
                    : isDisabled 
                    ? "Waiting for response..." 
                    : webSearchEnabled 
                      ? "Ask with web search enabled..." 
                      : "Ask Anything...")
                }
                className="w-full bg-transparent border-0 resize-none focus:outline-none text-foreground placeholder-muted-foreground text-sm leading-5"
                rows={1}
                style={{ 
                  minHeight: '24px', 
                  maxHeight: '120px',
                  lineHeight: '1.5'
                }}
                disabled={isDisabled || !hasSelectedModel}
              />
            </div>

            {/* Send button */}
            <div className="pb-1">
              <Button 
                onClick={handleSendMessage} 
                disabled={!message.trim() || isDisabled || !hasSelectedModel} 
                size="sm"
                className={cn(
                  "h-7 w-7 p-0 rounded-full transition-all duration-300 ease-in-out",
                  !message.trim() || isDisabled || !hasSelectedModel
                    ? "bg-muted text-muted-foreground cursor-not-allowed" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                )}
                title={!hasSelectedModel ? "Please select a model in Settings → Model Selection" : undefined}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Web search indicator */}
        {webSearchEnabled && (
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center justify-center mt-2 text-sm text-green-400 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              Web search enabled for this message
            </div>
          </div>
        )}
        
        {/* Model selection warning */}
        {!hasSelectedModel && (
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center justify-center mt-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Please select a model in Settings → Model Selection to start chatting</span>
            </div>
          </div>
        )}
        
        {/* Status indicators */}
        {isListening && (
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center justify-center mt-3 text-sm text-destructive animate-pulse">
              <span className="inline-block h-2 w-2 rounded-full bg-destructive mr-2"></span>
              Listening...
            </div>
          </div>
        )}
        
        {disabled && !isLoading && (
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center justify-center mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}

// Add TypeScript declarations for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}
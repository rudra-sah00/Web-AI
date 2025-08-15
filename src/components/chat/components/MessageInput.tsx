"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Send, 
  Loader2, 
  Mic, 
  MicOff, 
  Globe, 
  Paperclip,
  Code,
  Bold,
  Italic
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = isLoading || disabled;

  // Initialize speech recognition
  useEffect(() => {
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
            </Button>              <Button
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
                  (isDisabled 
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
                disabled={isDisabled}
              />
            </div>

            {/* Send button */}
            <div className="pb-1">
              <Button 
                onClick={handleSendMessage} 
                disabled={!message.trim() || isDisabled} 
                size="sm"
                className={cn(
                  "h-7 w-7 p-0 rounded-full transition-all duration-300 ease-in-out",
                  !message.trim() || isDisabled 
                    ? "bg-muted text-muted-foreground cursor-not-allowed" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                )}
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
            <div className="flex items-center justify-center mt-3 text-sm text-amber-400">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
              AI is thinking...
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
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Send, 
  Loader2, 
  Mic, 
  MicOff, 
  Globe, 
  Paperclip 
} from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, isLoading, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    
    onSendMessage(message);
    setMessage("");
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
  
  // Handle web search
  const handleWebSearch = () => {
    if (isDisabled) return;
    
    // Update the message with a web search template
    setMessage((prev) => 
      prev + (prev ? '\n\n' : '') + 'Please search the web for information about: '
    );
    
    // Focus the textarea
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      }
    }, 100);
  };

  return (
    <div className="border-t p-4">
      <div className="flex gap-2 items-end">
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10"
            title={isListening ? "Stop recording" : "Voice input"}
            onClick={toggleListening}
            disabled={isDisabled}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 text-destructive" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10"
            title="Web search"
            onClick={handleWebSearch}
            disabled={isDisabled}
          >
            <Globe className="h-4 w-4" />
          </Button>
          
          <label htmlFor="file-upload" className={`${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10"
              title="Attach file"
              type="button"
              onClick={() => !isDisabled && fileInputRef.current?.click()}
              disabled={isDisabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <input 
              id="file-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              disabled={isDisabled}
            />
          </label>
        </div>
        
        {/* Text input */}
        <div className={`flex-1 border rounded-lg overflow-hidden ${!isDisabled ? 'focus-within:ring-1 focus-within:ring-primary' : ''} ${isDisabled ? 'opacity-70' : ''}`}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isDisabled ? "Waiting for response..." : "Type a message..."}
            className="w-full p-3 focus:outline-none bg-transparent resize-none"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '150px' }}
            disabled={isDisabled}
          />
        </div>
        
        {/* Send button */}
        <Button 
          onClick={handleSendMessage} 
          disabled={!message.trim() || isDisabled} 
          className="h-10 px-4"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send
        </Button>
      </div>
      
      {/* Recording indicator */}
      {isListening && (
        <div className="flex items-center justify-center mt-2 text-xs text-primary animate-pulse">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-2"></span>
          Recording... Speak now
        </div>
      )}
      
      {/* AI response status */}
      {disabled && !isLoading && (
        <div className="flex items-center justify-center mt-2 text-xs text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
          AI is generating a response...
        </div>
      )}
    </div>
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
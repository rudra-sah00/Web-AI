"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "./types";
import MessageContent from "./MessageContent";

interface MessageItemProps {
  message: Message;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
}

export default function MessageItem({ message, onEdit, onDelete }: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [isCopied, setIsCopied] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(false);

  useEffect(() => {
    const displaySettings = localStorage.getItem('chatDisplaySettings');
    if (displaySettings) {
      const settings = JSON.parse(displaySettings);
      setShowTimestamps(settings.showTimestamps || false);
    }
  }, []);

  const handleEditSave = () => {
    onEdit(message.id, editText);
    setIsEditing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isUser = message.role === "user";

  return (
    <div className={cn(
      "w-full group py-4 transition-colors duration-200",
      isUser ? "bg-transparent" : "bg-transparent"
    )}>
      <div className="max-w-4xl mx-auto px-4">
        <div className={cn(
          "flex gap-4",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          {/* Message Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground min-h-[100px]"
                  placeholder="Edit your message..."
                />
                <div className={cn(
                  "flex gap-2",
                  isUser ? "justify-end" : "justify-start"
                )}>
                  <Button size="sm" onClick={handleEditSave} className="h-8 px-3 text-xs">
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="h-8 px-3 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className={cn(
                "relative flex",
                isUser ? "justify-end" : "justify-start"
              )}>
                {/* User Message: Chat Bubble */}
                {isUser ? (
                  <div className={cn(
                    "px-4 py-3 rounded-2xl shadow-sm bg-primary text-primary-foreground rounded-br-md",
                    "transition-all duration-300 hover:shadow-md overflow-hidden",
                    "inline-block max-w-[80%] min-w-fit w-auto"
                  )}>
                    <MessageContent 
                      content={message.content}
                      className="text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 whitespace-pre-wrap"
                    />
                    
                    {showTimestamps && (
                      <div className="text-xs mt-2 opacity-70 text-primary-foreground/80">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                ) : (
                  /* AI Message: Plain text without box */
                  <div className="py-1 max-w-[85%]">
                    <MessageContent 
                      content={message.content}
                      className="text-sm leading-relaxed text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                    />
                    
                    {showTimestamps && (
                      <div className="text-xs mt-2 opacity-70 text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                {!isEditing && (
                  <div className={cn(
                    "flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200",
                    isUser ? "justify-end" : "justify-start"
                  )}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-muted/60 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                      onClick={copyToClipboard}
                      title="Copy message"
                    >
                      {isCopied ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    
                    {isUser && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-muted/60 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsEditing(true)}
                        title="Edit message"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-md transition-colors"
                      onClick={() => onDelete(message.id)}
                      title="Delete message"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
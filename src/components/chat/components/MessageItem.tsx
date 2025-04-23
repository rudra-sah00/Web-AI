"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Bot, Edit3, Trash2, Copy, Check } from "lucide-react";
import { Message } from "./types";

interface MessageItemProps {
  message: Message;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
}

export default function MessageItem({ message, onEdit, onDelete }: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [isCopied, setIsCopied] = useState(false);

  const handleEditSave = () => {
    onEdit(message.id, editText);
    setIsEditing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <Card className={`max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : ""}`}>
        <CardContent className="p-3 relative group">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0">
              {message.role === "user" ? (
                <User className="h-5 w-5" />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <textarea 
                    value={editText} 
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 rounded border min-h-[100px] bg-background text-foreground"
                  />
                  <div className="flex justify-end gap-2 transition-opacity duration-300 ease-in-out">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleEditSave}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
          </div>

          {/* Message actions */}
          {message.role === "user" && !isEditing && (
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 transition-all duration-300 ease-in-out hover:bg-destructive/20 hover:text-destructive hover:scale-110" 
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="h-4 w-4 transition-transform duration-300" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                className="h-7 w-7 transition-all duration-300 ease-in-out hover:bg-primary/20 hover:scale-110" 
                onClick={() => onDelete(message.id)}
              >
                <Trash2 className="h-4 w-4 transition-transform duration-300 text-green-500 transition-transform duration-300 animate-in zoom-in-50" />
              </Button>
            </div>
          )}

          {message.role === "assistant" && (
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7"
                onClick={copyToClipboard}
              >
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ChatHeaderProps {
  title: string;
  hasMessages: boolean;
  onClearChat: () => void;
}

export default function ChatHeader({ title, hasMessages, onClearChat }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b p-4">
      <h2 className="text-xl font-semibold truncate animate-in fade-in slide-in-from-bottom-3 duration-300">
        {title || "New Chat"}
      </h2>
      {hasMessages && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearChat}
          title="Clear chat"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
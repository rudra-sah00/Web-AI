"use client";

interface ChatHeaderProps {
  title: string;
  hasMessages: boolean;
  onClearChat: () => void;
}

export default function ChatHeader({ title }: ChatHeaderProps) {
  return (
    <div className="border-b border-border bg-background">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Empty header - title only shown in sidebar */}
      </div>
    </div>
  );
}
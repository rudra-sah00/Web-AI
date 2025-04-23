"use client";
 
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import ChatModule from "@/components/chat/ChatModule";

export default function Home() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AppLayout>
      {({ selectedChatId: chatId, sidebarCollapsed: collapsed }: { selectedChatId: string | null; sidebarCollapsed: boolean }) => {
        // Use useEffect to handle state updates from props
        useEffect(() => {
          if (selectedChatId !== chatId) {
            setSelectedChatId(chatId);
          }
        }, [chatId]);

        useEffect(() => {
          if (sidebarCollapsed !== collapsed) {
            setSidebarCollapsed(collapsed);
          }
        }, [collapsed]);

        return (
          <div className="h-full w-full">
            <ChatModule 
              sidebarCollapsed={sidebarCollapsed} 
              selectedChatId={selectedChatId || undefined} 
              onChatUpdate={(chat) => {
                // We could handle chat updates if needed
              }}
            />
          </div>
        );
      }}
    </AppLayout>
  );
}

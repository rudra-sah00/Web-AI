"use client";

import { useParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import ChatModule from "@/components/chat/ChatModule";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;

  return (
    <AppLayout>
      {({ sidebarCollapsed, onChatCreated, onMessageSent }: { 
        sidebarCollapsed: boolean;
        onChatCreated: (chatId: string) => void;
        onMessageSent: () => void;
      }) => (
        <div className="h-full w-full">
          <ChatModule 
            sidebarCollapsed={sidebarCollapsed} 
            selectedChatId={chatId} 
            onChatUpdate={(chat) => {
              // Handle chat updates and notify parent of new chats
              if (chat && chat.id !== chatId) {
                onChatCreated(chat.id);
              }
            }}
            onMessageSent={onMessageSent}
          />
        </div>
      )}
    </AppLayout>
  );
}

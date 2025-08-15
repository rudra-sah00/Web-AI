"use client";

import AppLayout from "@/components/AppLayout";
import ChatModule from "@/components/chat/ChatModule";

export default function ChatHomePage() {
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
            selectedChatId={undefined} 
            onChatUpdate={(chat) => {
              // Handle chat updates and notify parent of new chats
              if (chat) {
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

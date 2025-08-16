"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import SimpleSidebar from "@/components/sidebar/SimpleSidebar";
import { Chat } from "@/components/chat/components/types";

interface AppLayoutChildrenProps {
  selectedChatId: string | null;
  sidebarCollapsed: boolean;
  onChatCreated: (chatId: string) => void;
  onChatUpdate: (chat: Chat) => void;
  onMessageSent: () => void;
}

interface AppLayoutProps {
  children: React.ReactNode | ((props: AppLayoutChildrenProps) => React.ReactNode);
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Extract chatId from current path
  const getCurrentChatId = (): string | null => {
    const match = pathname.match(/^\/chat\/(.+)$/);
    return match ? match[1] : null;
  };

  // Function to handle sidebar collapse state changes
  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  // Function to handle chat selection
  const handleChatSelect = (chatId: string | null) => {
    if (chatId) {
      router.push(`/chat/${chatId}`);
    } else {
      router.push('/chat');
    }
  };

  // Function to handle new chat creation
  const handleChatCreated = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  // Function to handle chat updates
  const handleChatUpdate = (chat: Chat) => {
    // SimpleSidebar handles its own refresh
  };

  // Function to handle message sent
  const handleMessageSent = () => {
    // SimpleSidebar handles its own state
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <SimpleSidebar 
        onChatSelect={handleChatSelect}
        onCollapseChange={handleSidebarCollapse}
      />

      {/* Main content */}
      <div 
        className="relative flex flex-1 flex-col overflow-hidden transition-all duration-300" 
        style={{ 
          marginLeft: sidebarCollapsed ? '64px' : '288px' 
        }}
      >
        <main className="flex-1 overflow-hidden">
          {/* Pass selectedChatId and sidebarCollapsed to children */}
          {children && typeof children === 'function' 
            ? children({ 
                selectedChatId: getCurrentChatId(), 
                sidebarCollapsed, 
                onChatCreated: handleChatCreated, 
                onChatUpdate: handleChatUpdate, 
                onMessageSent: handleMessageSent 
              }) 
            : children
          }
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
};

export default AppLayout;
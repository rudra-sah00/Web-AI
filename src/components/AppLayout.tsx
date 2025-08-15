"use client";

import { useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/sidebar/Sidebar";

interface AppLayoutChildrenProps {
  selectedChatId: string | null;
  sidebarCollapsed: boolean;
  onChatCreated: (chatId: string) => void;
  onMessageSent: () => void;
}

interface AppLayoutProps {
  children: React.ReactNode | ((props: AppLayoutChildrenProps) => React.ReactNode);
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarRef = useRef<{ refreshChats: () => void }>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Extract chatId from current path
  const getCurrentChatId = (): string | null => {
    const match = pathname.match(/^\/chat\/(.+)$/);
    return match ? match[1] : null;
  };

  // Auto-hide sidebar when message is sent (ChatGPT style)
  const handleMessageSent = () => {
    // Close mobile sidebar when message is sent
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
    // Auto-collapse sidebar on smaller screens when sending a message
    if (!sidebarCollapsed && window.innerWidth < 1200) {
      setSidebarCollapsed(true);
    }
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
    // Refresh sidebar to show the new chat
    if (sidebarRef.current?.refreshChats) {
      sidebarRef.current.refreshChats();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        ref={sidebarRef}
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen}
        onChatSelect={handleChatSelect}
        onCollapseChange={handleSidebarCollapse}
      />

      {/* Main content */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {/* Pass selectedChatId and sidebarCollapsed to children */}
          {children && typeof children === 'function' 
            ? children({ selectedChatId: getCurrentChatId(), sidebarCollapsed, onChatCreated: handleChatCreated, onMessageSent: handleMessageSent }) 
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
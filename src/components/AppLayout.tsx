"use client";

import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/sidebar/Sidebar";

interface AppLayoutChildrenProps {
  selectedChatId: string | null;
  sidebarCollapsed: boolean;
}

interface AppLayoutProps {
  children: React.ReactNode | ((props: AppLayoutChildrenProps) => React.ReactNode);
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Function to handle sidebar collapse state changes
  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  // Function to handle chat selection
  const handleChatSelect = (chatId: string | null) => {
    setSelectedChatId(chatId);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen}
        onChatSelect={handleChatSelect}
        onCollapseChange={handleSidebarCollapse}
      />

      {/* Main content */}
      <div className="relative flex flex-1 flex-col">
        <main className="flex-1">
          {/* Pass selectedChatId and sidebarCollapsed to children */}
          {children && typeof children === 'function' 
            ? children({ selectedChatId, sidebarCollapsed }) 
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
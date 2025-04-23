"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  PanelRight, 
  Plus,
  Cpu,
  Loader2,
  Trash2
} from "lucide-react";
import SettingsDialog from "@/components/setting/SettingsDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

interface Chat {
  id: string;
  title: string;
  messages: any[];
  createdAt: string;
  updatedAt: string;
}

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onChatSelect?: (chatId: string | null) => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ 
  isMobileOpen, 
  setIsMobileOpen, 
  onChatSelect,
  onCollapseChange
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load chats from server API
  useEffect(() => {
    fetchChats();
  }, []);

  // Load saved sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      const isCollapsed = savedState === 'true';
      setCollapsed(isCollapsed);
      if (onCollapseChange) {
        onCollapseChange(isCollapsed);
      }
    }
  }, [onCollapseChange]);

  const fetchChats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const data = await response.json();
        // Sort chats by updatedAt date (most recent first)
        data.sort((a: Chat, b: Chat) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setChats(data);
      } else {
        console.error('Error fetching chats:', await response.text());
        setError('Failed to load chats');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Network error while loading chats');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsAnimating(true);
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    
    // Save state to localStorage
    localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
    
    if (onCollapseChange) {
      onCollapseChange(newCollapsed);
    }
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Match this to the animation duration
  };

  const createNewChat = async () => {
    setError(null);
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`/api/chats/${newChatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChat),
      });

      if (response.ok) {
        // Add to local state
        setChats([newChat, ...chats]);
        
        // Select the new chat
        handleChatSelect(newChatId);
        
        // Expand sidebar if it's collapsed
        if (collapsed) {
          toggleSidebar();
        }
      } else {
        console.error('Error creating chat:', await response.text());
        setError('Failed to create new chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      setError('Network error while creating chat');
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    if (onChatSelect) {
      onChatSelect(chatId);
    }
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const handleDeleteChat = async (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent chat selection when deleting
    setError(null);
    
    if (confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/chats/${chatId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove from local state
          const updatedChats = chats.filter(chat => chat.id !== chatId);
          setChats(updatedChats);
          
          // If the deleted chat was selected, clear selection
          if (selectedChatId === chatId) {
            setSelectedChatId(null);
            if (onChatSelect) {
              onChatSelect(null);
            }
          }
        } else {
          console.error('Error deleting chat:', await response.text());
          setError('Failed to delete chat');
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
        setError('Network error while deleting chat');
      }
    }
  };

  // Function to update chat list when a chat is modified
  const refreshChats = () => {
    fetchChats();
  };

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <PanelRight className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* External sidebar toggle button (only toggle button) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        disabled={isAnimating}
        className={cn(
          "fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-background/60 backdrop-blur-sm border-r border-y shadow-md",
          "rounded-none rounded-r-lg h-14 w-6",
          "transition-all duration-300 ease-in-out",
          "hover:bg-primary/10 hover:shadow-lg",
          "md:flex hidden items-center justify-center",
          collapsed ? "translate-x-16" : "translate-x-64",
        )}
      >
        {collapsed ? 
          <ChevronRight className={cn("h-4 w-4", isAnimating && "animate-pulse")} /> : 
          <ChevronLeft className={cn("h-4 w-4", isAnimating && "animate-pulse")} />
        }
      </Button>

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform border-r bg-background transition-all",
          collapsed ? "duration-500 ease-in-out" : "duration-400 ease-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "w-16" : "w-64",
        )}
        style={{ boxShadow: "0 0 15px rgba(0, 0, 0, 0.05)" }}
      >
        {/* Logo and header - simplified */}
        <div className={cn(
          "flex h-16 items-center border-b px-4 relative",
          "justify-center",
          "transition-all duration-300",
        )}>
          <div className={cn(
            "flex items-center overflow-hidden",
            "justify-center w-full",
          )}>
            <Cpu className={cn(
              "h-6 w-6 flex-shrink-0 text-primary",
              collapsed ? "scale-110 transition-transform duration-300" : "",
            )} />
          </div>
        </div>

        {/* New chat button */}
        <div className={cn(
          "p-4",
          "transition-all duration-300",
        )}>
          <Button 
            className={cn(
              "w-full group", 
              collapsed ? "px-2 justify-center" : "justify-start gap-2",
              "transition-all duration-300 ease-in-out",
              "hover:shadow-md hover:bg-primary/10",
            )}
            onClick={createNewChat}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className={cn(
                "h-4 w-4",
                "transition-all duration-300 group-hover:rotate-90",
              )} />
            )}
            {!collapsed && (
              <span className={cn(
                "transition-all duration-300",
              )}>
                New Chat
              </span>
            )}
          </Button>
        </div>

        {/* Chat list */}
        <nav className="flex-1 overflow-y-auto p-2">
          {error && !collapsed && (
            <div className="bg-destructive/15 text-destructive p-2 rounded-md mb-4 text-xs">
              {error}
              <Button 
                variant="link" 
                size="sm" 
                onClick={fetchChats} 
                className="p-0 h-auto text-xs ml-2"
              >
                Retry
              </Button>
            </div>
          )}
          
          <div className={cn("mb-4", collapsed ? "hidden" : "block")}>
            <h2 className="px-2 text-xs font-semibold text-muted-foreground">Chats</h2>
          </div>
          
          <div className="space-y-1">
            {isLoading && !chats.length ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <>
                {chats.map((chat, index) => (
                  <div 
                    key={chat.id} 
                    className={cn(
                      "relative group",
                      collapsed ? "px-2" : "",
                      "transition-all duration-300 ease-in-out",
                    )}
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      animation: !isAnimating ? `fadeIn 300ms ease forwards` : 'none' 
                    }}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full text-left text-sm",
                        collapsed ? "px-2 justify-center" : "justify-start",
                        selectedChatId === chat.id ? "bg-secondary text-secondary-foreground" : "",
                        "transition-all duration-200 ease-in-out",
                        selectedChatId === chat.id ? "hover:bg-secondary" : "hover:bg-secondary/40",
                      )}
                      onClick={() => handleChatSelect(chat.id)}
                    >
                      <MessageSquare className={cn(
                        "h-4 w-4",
                        collapsed ? "" : "mr-2 shrink-0",
                        selectedChatId === chat.id ? "text-primary" : "",
                        "transition-all duration-300",
                      )} />
                      
                      <div className={cn(
                        "flex-1 truncate",
                        collapsed ? "hidden" : "block",
                        "transition-all duration-300",
                      )}>
                        <div className="truncate">{chat.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Button>
                    
                    {!collapsed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-7 w-7",
                          "transition-all duration-200 ease-in-out",
                          "hover:bg-destructive hover:text-destructive-foreground",
                        )}
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        title="Delete chat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    
                    {collapsed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "absolute -right-9 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-7 w-7 bg-background",
                          "transition-all duration-200 ease-in-out",
                          "hover:bg-destructive hover:text-destructive-foreground",
                        )}
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        title="Delete chat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {!isLoading && !chats.length && (
                  <div className={cn("text-center text-muted-foreground text-sm p-4", collapsed && "hidden")}>
                    No chats yet. Create a new chat to get started.
                  </div>
                )}
              </>
            )}
          </div>
        </nav>

        {/* Footer with settings and theme toggle - with consistent icons */}
        <div className="border-t p-4 fixed bottom-0 left-0 bg-background w-full">
          <div className={cn(
            "flex",
            collapsed ? "flex-col items-center" : "items-center justify-between"
          )}>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size={collapsed ? "icon" : "default"}
                  className={cn(
                    collapsed ? "w-full flex justify-center" : "gap-2 group"
                  )}
                >
                  <Settings className={cn(
                    "h-4 w-4 transition-all duration-300",
                    !collapsed && "group-hover:rotate-45"
                  )} />
                  {!collapsed && <span>Settings</span>}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <SettingsDialog />
              </DialogContent>
            </Dialog>
            
            <ThemeSelector 
              collapsed={collapsed}
              className={cn(
                collapsed ? "mt-2" : "",
                "w-auto"
              )}
              size={collapsed ? "icon" : "default"}
            />
          </div>
          
          {!collapsed && (
            <div className="text-xs text-muted-foreground mt-4">
              <p>© {new Date().getFullYear()} Ollama AI</p>
              <p className="mt-1">v1.0.0</p>
            </div>
          )}
        </div>
      </aside>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
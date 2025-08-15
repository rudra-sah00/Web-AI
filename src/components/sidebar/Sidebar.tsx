"use client";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
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
  Trash2,
  Edit3,
  MoreHorizontal,
  Archive,
  Star,
  Clock
} from "lucide-react";

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
  autoHide?: boolean;
}

export default forwardRef(function Sidebar({ 
  isMobileOpen, 
  setIsMobileOpen, 
  onChatSelect,
  onCollapseChange,
  autoHide = false
}: SidebarProps, ref) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load chats when component mounts
  useEffect(() => {
    fetchChats();
  }, []);

  // Sync selectedChatId with current URL
  useEffect(() => {
    const match = pathname.match(/^\/chat\/(.+)$/);
    const currentChatId = match ? match[1] : null;
    setSelectedChatId(currentChatId);
  }, [pathname]);

  // Expose refreshChats method via ref
  useImperativeHandle(ref, () => ({
    refreshChats: () => {
      fetchChats();
    }
  }));

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
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const data = await response.json();
        // Ensure all chats have a messages array and sort by updatedAt date (most recent first)
        const safeChats = data.map((chat: any) => ({
          ...chat,
          messages: chat.messages || []
        }));
        safeChats.sort((a: Chat, b: Chat) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setChats(safeChats);
      } else {
        console.error('Error fetching chats:', await response.text());
        setError('Failed to load chats');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Network error while loading chats');
    setChats([]);
    } finally {
      setLoading(false);
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
    
    // Check if there's already an empty chat (no messages)
    const existingEmptyChat = chats.find(chat => chat.messages.length === 0);
    if (existingEmptyChat) {
      // Navigate to the existing empty chat instead of creating a new one
      router.push(`/chat/${existingEmptyChat.id}`);
      
      // Expand sidebar if it's collapsed
      if (collapsed) {
        toggleSidebar();
      }
      return;
    }
    
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
        
        // Navigate to the new chat
        router.push(`/chat/${newChatId}`);
        
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
    // Navigate to the chat URL
    router.push(`/chat/${chatId}`);
    
    // Auto-hide sidebar on mobile and small screens when selecting a chat
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
    // Auto-collapse sidebar on message send if autoHide is enabled (ChatGPT style)
    if (autoHide && !collapsed && window.innerWidth < 1200) {
      toggleSidebar();
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
          
          // If the deleted chat was selected, navigate to welcome screen
          if (selectedChatId === chatId) {
            router.push('/chat');
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
          "fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-background/80 backdrop-blur-sm border-r border-y shadow-lg",
          "rounded-none rounded-r-lg h-12 w-8",
          "transition-all duration-300 ease-in-out",
          "hover:bg-primary/20 hover:shadow-xl hover:w-10",
          "md:flex hidden items-center justify-center",
          "border-border/50 hover:border-primary/30",
          collapsed ? "translate-x-16" : "translate-x-64",
        )}
      >
        {collapsed ? 
          <ChevronRight className={cn("h-4 w-4 text-foreground", isAnimating && "animate-pulse")} /> : 
          <ChevronLeft className={cn("h-4 w-4 text-foreground", isAnimating && "animate-pulse")} />
        }
      </Button>

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all",
          collapsed ? "duration-500 ease-in-out" : "duration-400 ease-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "w-16" : "w-72",
        )}
        style={{ 
          boxShadow: "0 0 30px rgba(0, 0, 0, 0.08)",
          borderRight: "1px solid hsl(var(--border))"
        }}
      >
        {/* Clean header with just the icon */}
        <div className={cn(
          "flex h-16 items-center border-b px-4 relative bg-gradient-to-r from-primary/5 to-primary/10",
          "justify-center",
          "transition-all duration-300",
        )}>
          <div className="relative">
            <Cpu className={cn(
              "h-7 w-7 flex-shrink-0 text-primary",
              collapsed ? "scale-110 transition-transform duration-300" : "",
            )} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* New chat button - enhanced */}
        <div className={cn(
          "p-4 bg-gradient-to-b from-background to-muted/20",
          "transition-all duration-300",
        )}>
          <Button 
            className={cn(
              "w-full group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground", 
              collapsed ? "px-2 justify-center" : "justify-start gap-3",
              "transition-all duration-300 ease-in-out",
              "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
              "border border-primary/20 backdrop-blur-sm",
            )}
            onClick={createNewChat}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className={cn(
                "h-5 w-5",
                "transition-all duration-300 group-hover:rotate-90",
              )} />
            )}
            {!collapsed && (
              <span className={cn(
                "font-medium transition-all duration-300",
              )}>
                New Chat
              </span>
            )}
          </Button>
        </div>

        {/* Chat list - enhanced */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2 pb-20">
          {error && !collapsed && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-lg mb-4 text-sm border border-destructive/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-destructive rounded-full" />
                <span className="font-medium">Connection Error</span>
              </div>
              {error}
              <Button 
                variant="link" 
                size="sm" 
                onClick={fetchChats} 
                className="p-0 h-auto text-sm ml-0 mt-2 text-destructive hover:text-destructive/80"
              >
                Try Again
              </Button>
            </div>
          )}
          
          <div className={cn("mb-6", collapsed ? "hidden" : "block")}>
            <div className="flex items-center justify-between px-3 mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Chats
              </h2>
              <Star className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </div>
          
          <div className="space-y-1">
            {loading && !chats.length ? (
              <div className="flex justify-center p-8">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  {!collapsed && <span className="text-sm text-muted-foreground">Loading chats...</span>}
                </div>
              </div>
            ) : (
              <>
                {chats.map((chat, index) => (
                  <div 
                    key={chat.id} 
                    className={cn(
                      "relative group",
                      collapsed ? "px-1" : "px-1",
                      "transition-all duration-300 ease-in-out",
                    )}
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      animation: !isAnimating ? `fadeIn 400ms ease forwards` : 'none' 
                    }}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full text-left text-sm relative overflow-hidden",
                        collapsed ? "px-3 justify-center h-12" : "justify-start px-3 py-3 h-auto",
                        selectedChatId === chat.id 
                          ? "bg-gradient-to-r from-primary/15 to-primary/5 text-foreground border border-primary/20 shadow-sm" 
                          : "hover:bg-muted/60",
                        "transition-all duration-200 ease-in-out rounded-lg",
                        "group-hover:shadow-md",
                      )}
                      onClick={() => handleChatSelect(chat.id)}
                    >
                      <MessageSquare className={cn(
                        "h-4 w-4 flex-shrink-0",
                        collapsed ? "" : "mr-3",
                        selectedChatId === chat.id ? "text-primary" : "text-muted-foreground",
                        "transition-all duration-300",
                      )} />
                      
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium text-sm mb-1">
                            {chat.title}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <span>{new Date(chat.updatedAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{chat.messages?.length || 0} messages</span>
                          </div>
                        </div>
                      )}
                      
                      {selectedChatId === chat.id && (
                        <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full" />
                      )}
                    </Button>
                    
                    {!collapsed && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle rename (you can implement this)
                          }}
                          title="Rename chat"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          title="Delete chat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    
                    {collapsed && (
                      <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-background border rounded-lg shadow-lg transition-all duration-200 flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle rename
                          }}
                          title="Rename chat"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          title="Delete chat"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {!loading && !chats.length && (
                  <div className={cn(
                    "text-center text-muted-foreground text-sm p-8 space-y-3", 
                    collapsed && "hidden"
                  )}>
                    <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">No conversations yet</p>
                      <p className="text-xs">Start a new chat to begin your AI conversation</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </nav>

        {/* Footer with settings - enhanced and fixed to bottom */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 border-t bg-gradient-to-t from-muted/30 to-background/95 backdrop-blur-sm p-4",
          collapsed ? "w-16" : "w-72"
        )}>
          <div className={cn(
            "flex gap-2",
            collapsed ? "flex-col items-center" : "items-center justify-center"
          )}>
            <Link href="/settings" className="w-full">
              <Button 
                variant="ghost" 
                size={collapsed ? "icon" : "default"}
                className={cn(
                  "w-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                  collapsed 
                    ? "h-12 flex justify-center hover:bg-primary/10" 
                    : "gap-3 group hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 border border-transparent hover:border-primary/20 rounded-lg"
                )}
              >
                <Settings className={cn(
                  "h-5 w-5 transition-all duration-300",
                  !collapsed && "group-hover:rotate-45"
                )} />
                {!collapsed && <span className="font-medium">Settings</span>}
              </Button>
            </Link>
          </div>
          
          {/* Footer removed - clean design */}
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
});
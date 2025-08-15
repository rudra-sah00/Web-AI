"use client";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import { 
  MessageSquare, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  PanelRight, 
  Plus,
  Loader2,
  Trash2,
  MoreHorizontal,
  Archive,
  Star,
  Clock
} from "lucide-react";

interface Chat {
  id: string;
  title: string;
  messages: any[];
  messageCount?: number;
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

// AI Brain Animation Data
const aiBrainAnimation = {
  "v":"5.9.0","fr":30,"ip":0,"op":60,"w":500,"h":500,"nm":"48 Ai In Finance","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":3,"nm":"Null Object","sr":1,"ks":{"o":{"a":0,"k":0,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[250,250,0],"ix":2,"l":2},"a":{"a":0,"k":[50,50,0],"ix":1,"l":2},"s":{"a":0,"k":[500,500,100],"ix":6,"l":2}},"ao":0,"ip":0,"op":90,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":3,"nm":"Ai & box","parent":11,"sr":1,"ks":{"o":{"a":0,"k":0,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[0,2,0],"ix":2,"l":2},"a":{"a":0,"k":[50,50,0],"ix":1,"l":2},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"t":0,"s":[100,100,100]},{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"t":8.675,"s":[90,90,100]},{"i":{"x":[0.833,0.833,0.833],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"t":17.333,"s":[110,110,100]},{"t":26,"s":[100,100,100]}],"ix":6,"l":2}},"ao":0,"ip":0,"op":90,"st":0,"bm":0},{"ddd":0,"ind":3,"ty":4,"nm":"Ai","parent":2,"sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":1,"k":[{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":0,"s":[50,52,0],"to":[0,-1.167,0],"ti":[0,0,0]},{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":30,"s":[50,45,0],"to":[0,0,0],"ti":[0,-1.167,0]},{"t":60,"s":[50,52,0]}],"ix":2,"l":2},"a":{"a":0,"k":[4.955,6.355,0],"ix":1,"l":2},"s":{"a":0,"k":[500,500,100],"ix":6,"l":2}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0.186,0],[0.127,0.127],[0,0.186],[0,0],[-0.127,0.132],[-0.187,0],[-0.133,-0.132],[0,-0.186],[0,0],[0.132,-0.127]],"o":[[-0.187,0],[-0.127,-0.127],[0,0],[0,-0.186],[0.127,-0.132],[0.186,0],[0.132,0.132],[0,0],[0,0.186],[-0.133,0.127]],"v":[[10.775,11.558],[10.304,11.367],[10.114,10.897],[10.114,1.828],[10.304,1.35],[10.775,1.152],[11.253,1.35],[11.451,1.828],[11.451,10.897],[11.253,11.367]],"c":true},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.109803922474,0.04705882445,0.20000000298,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":2,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]],"v":[[1.222,7.634],[5.19,7.634],[3.206,2.857]],"c":true},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0.303,0],[0.117,0.127],[0,0.186],[-0.049,0.118],[0,0],[-0.142,0.123],[-0.216,0],[0,0],[-0.138,-0.122],[-0.069,-0.157],[0,0],[0,-0.078],[0.118,-0.127],[0.206,0],[0.118,0.275],[0,0],[0,0],[0,0]],"o":[[-0.206,0],[-0.118,-0.127],[0,-0.078],[0,0],[0.068,-0.157],[0.142,-0.122],[0,0],[0.225,0],[0.137,0.123],[0,0],[0.049,0.118],[0,0.186],[-0.118,0.127],[-0.304,0],[0,0],[0,0],[0,0],[-0.117,0.275]],"v":[[-0.88,11.558],[-1.365,11.367],[-1.542,10.897],[-1.468,10.603],[2.28,1.755],[2.596,1.335],[3.132,1.152],[3.279,1.152],[3.823,1.335],[4.132,1.755],[7.88,10.603],[7.953,10.897],[7.777,11.367],[7.292,11.558],[6.66,11.147],[5.705,8.854],[0.707,8.854],[-0.249,11.147]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.109803922474,0.04705882445,0.20000000298,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 2","np":3,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 3","np":2,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":90,"st":0,"bm":0},{"ddd":0,"ind":10,"ty":4,"nm":"Mrain","parent":11,"sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[0,0,0],"ix":2,"l":2},"a":{"a":0,"k":[4.955,6.355,0],"ix":1,"l":2},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"t":0,"s":[500,500,100]},{"i":{"x":[0.3,0.3,0.3],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"t":7.5,"s":[525,475,100]},{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.7,0.7,0.7],"y":[0,0,0]},"t":15,"s":[475,525,100]},{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"t":22.5,"s":[525,475,100]},{"t":30,"s":[500,500,100]}],"ix":6,"l":2}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,-3.822],[0,0],[3.832,0],[0,3.832],[-0.03,0.21],[-1.691,0],[0,3.832],[0.26,0.71],[0.57,0.65],[0.02,0.02],[-0.15,0],[0,3.832],[3.301,0.53],[0,2.681],[3.782,0.04],[-0.06,0.11],[-0.12,0.51],[0,0.56],[3.832,0],[0.72,-0.27],[3.111,0]],"o":[[0,0],[0,3.832],[-3.832,0],[0,-0.21],[1.211,0.99],[3.822,0],[0,-0.8],[-0.28,-0.84],[-0.02,-0.02],[0.15,0.02],[3.832,0],[0,-3.442],[2.231,-1.151],[0,-3.792],[0.06,-0.1],[0.23,-0.45],[0.13,-0.52],[0,-3.822],[-0.81,0],[-0.88,-2.821],[-3.832,0]],"v":[[6.101,-16.29],[6.101,28.99],[13.034,35.933],[19.977,28.99],[19.937,28.36],[24.389,29.961],[31.322,23.018],[30.922,20.736],[29.621,18.485],[29.571,18.425],[30.012,18.445],[36.955,11.502],[31.132,4.669],[34.884,-1.493],[28.031,-8.427],[28.201,-8.737],[28.731,-10.187],[28.931,-11.828],[21.988,-18.761],[19.667,-18.351],[13.034,-23.223]],"c":true},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.717647075653,0.654901981354,0.949019610882,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 11","np":2,"cix":2,"bm":0,"ix":11,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,-3.822],[0,0],[3.832,0],[0,3.832],[-0.03,0.21],[1.691,0],[0,3.832],[-0.26,0.71],[-0.57,0.65],[-0.02,0.02],[0.15,0],[0,3.832],[-3.301,0.53],[0,2.681],[-3.782,0.04],[0.06,0.11],[0.12,0.51],[0,0.56],[-3.832,0],[-0.72,-0.27],[-3.111,0]],"o":[[0,0],[0,3.832],[-3.832,0],[0,-0.21],[-1.211,0.99],[-3.822,0],[0,-0.8],[0.28,-0.84],[0.02,-0.02],[-0.15,0.02],[-3.832,0],[0,-3.442],[-2.231,-1.151],[0,-3.792],[-0.06,-0.1],[-0.23,-0.45],[-0.13,-0.52],[0,-3.822],[0.81,0],[0.88,-2.821],[3.832,0]],"v":[[3.809,-16.29],[3.809,28.99],[-3.125,35.933],[-10.068,28.99],[-10.028,28.36],[-14.48,29.961],[-21.413,23.018],[-21.013,20.736],[-19.712,18.485],[-19.662,18.425],[-20.102,18.445],[-27.045,11.502],[-21.223,4.669],[-24.974,-1.493],[-18.121,-8.427],[-18.291,-8.737],[-18.822,-10.187],[-19.022,-11.828],[-12.079,-18.761],[-9.758,-18.351],[-3.125,-23.223]],"c":true},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.074509806931,0.811764717102,0.470588237047,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 21","np":2,"cix":2,"bm":0,"ix":21,"mn":"ADBE Vector Group","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 5","np":21,"cix":2,"bm":0,"ix":3,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":90,"st":0,"bm":0},{"ddd":0,"ind":11,"ty":3,"nm":"Over all conto..","parent":1,"sr":1,"ks":{"o":{"a":0,"k":0,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":1,"k":[{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":0,"s":[50,51,0],"to":[0,-0.393,0],"ti":[0,0,0]},{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":30,"s":[50,48.641,0],"to":[0,0,0],"ti":[0,-0.393,0]},{"t":59,"s":[50,51,0]}],"ix":2,"l":2},"a":{"a":0,"k":[0,0,0],"ix":1,"l":2},"s":{"a":0,"k":[20,20,100],"ix":6,"l":2}},"ao":0,"ip":0,"op":90,"st":0,"bm":0}],"markers":[]
};

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

  // Set up polling for real-time chat updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChats();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Listen for storage events to update when chats change in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chatUpdated') {
        fetchChats();
      }
    };

    const handleChatUpdate = () => {
      fetchChats();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('chatUpdated', handleChatUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('chatUpdated', handleChatUpdate);
    };
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
    },
    updateChatCount: (chatId: string) => {
      // Trigger a refresh when a specific chat is updated
      fetchChats();
    }
  }));

  // Expose global function to trigger chat updates
  useEffect(() => {
    (window as any).triggerSidebarUpdate = () => {
      fetchChats();
    };

    return () => {
      delete (window as any).triggerSidebarUpdate;
    };
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
            <Lottie 
              animationData={aiBrainAnimation}
              className={cn(
                "h-12 w-12 flex-shrink-0",
                collapsed ? "scale-110 transition-transform duration-300" : "",
              )}
              loop={true}
              autoplay={true}
            />
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
                            <span>{chat.messageCount ?? chat.messages?.length ?? 0} messages</span>
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
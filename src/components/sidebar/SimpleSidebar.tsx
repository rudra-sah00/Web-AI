"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Settings, 
  Plus,
  Loader2,
  Trash2,
  Brain
} from "lucide-react";

interface Chat {
  id: string;
  title: string;
  messages: any[];
  messageCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface SimpleSidebarProps {
  onChatSelect?: (chatId: string | null) => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function SimpleSidebar({ onChatSelect, onCollapseChange }: SimpleSidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Sync selectedChatId with current URL
  useEffect(() => {
    const match = pathname.match(/^\/chat\/(.+)$/);
    const currentChatId = match ? match[1] : null;
    setSelectedChatId(currentChatId);
  }, [pathname]);

  // Notify parent about collapse state
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(!isHovered);
    }
  }, [isHovered, onCollapseChange]);

  // Load chats
  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chats');
      if (response.ok) {
        const chatData = await response.json();
        setChats(Array.isArray(chatData) ? chatData : []);
      } else {
        setChats([]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    if (onChatSelect) {
      onChatSelect(chatId);
    }
  };

  // Handle new chat creation
  const handleNewChat = () => {
    if (onChatSelect) {
      onChatSelect(null);
    }
  };

  // Delete chat
  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      try {
        const response = await fetch(`/api/chats/${chatId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchChats(); // Refresh the list
          if (selectedChatId === chatId) {
            handleNewChat(); // Navigate to new chat if current chat was deleted
          }
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isHovered ? 288 : 64 // w-72 = 288px, w-16 = 64px
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut" 
      }}
      className="fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        boxShadow: "0 0 30px rgba(0, 0, 0, 0.08)",
        borderRight: "1px solid hsl(var(--border))"
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex h-16 items-center justify-center border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="relative">
          <Brain className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* New Chat Button */}
      <div className="flex-shrink-0 p-3">
        <Link href="/chat" onClick={handleNewChat}>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-center transition-all duration-200",
              isHovered ? "justify-start" : "justify-center px-2"
            )}
          >
            <Plus className="h-4 w-4" />
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-2 whitespace-nowrap"
                >
                  New Chat
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </Link>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <Link key={chat.id} href={`/chat/${chat.id}`}>
                <div
                  className={cn(
                    "group flex items-center rounded-lg px-2 py-2 text-sm transition-all duration-200 hover:bg-accent",
                    selectedChatId === chat.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
                    isHovered ? "justify-between" : "justify-center"
                  )}
                  onClick={() => handleChatSelect(chat.id)}
                >
                  <div className="flex items-center min-w-0">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <AnimatePresence>
                      {isHovered && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-2 truncate"
                        >
                          {chat.title || 'New Chat'}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {isHovered && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="flex-shrink-0 border-t p-3">
        <Link href="/settings">
          <Button
            variant="ghost"
            className={cn(
              "w-full transition-all duration-200",
              isHovered ? "justify-start" : "justify-center px-2"
            )}
          >
            <Settings className="h-4 w-4" />
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-2 whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </Link>
      </div>

    </motion.aside>
  );
}

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CHATS_DIR = path.join(DATA_DIR, 'chats');

// Define interfaces for type safety
interface ChatMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  preview: string;
}

interface ChatData extends ChatMetadata {
  messages: Array<{
    content: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(CHATS_DIR)) {
  fs.mkdirSync(CHATS_DIR, { recursive: true });
}

// Helper function to read chat index from file
function getChatIndex(): ChatMetadata[] {
  const indexPath = path.join(DATA_DIR, 'chat-index.json');
  
  if (!fs.existsSync(indexPath)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(indexPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading chat index:', error);
    return [];
  }
}

// Helper function to write chat index to file
function writeChatIndex(chats: ChatMetadata[]): boolean {
  const indexPath = path.join(DATA_DIR, 'chat-index.json');
  
  try {
    fs.writeFileSync(indexPath, JSON.stringify(chats, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to chat index:', error);
    return false;
  }
}

// Helper function to save individual chat to its own file
function saveChatToFile(chat: ChatData): boolean {
  if (!chat || !chat.id) return false;
  
  const chatPath = path.join(CHATS_DIR, `${chat.id}.json`);
  
  try {
    fs.writeFileSync(chatPath, JSON.stringify(chat, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving chat ${chat.id}:`, error);
    return false;
  }
}

// GET all chats (returns metadata with message counts)
export async function GET(): Promise<NextResponse> {
  const chats = getChatIndex();
  
  // Load message counts for each chat
  const chatsWithCounts = chats.map(chat => {
    try {
      const chatPath = path.join(CHATS_DIR, `${chat.id}.json`);
      if (fs.existsSync(chatPath)) {
        const chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
        return {
          ...chat,
          messages: chatData.messages || [],
          messageCount: (chatData.messages || []).length
        };
      }
    } catch (error) {
      console.error(`Error loading chat ${chat.id}:`, error);
    }
    
    return {
      ...chat,
      messages: [],
      messageCount: 0
    };
  });
  
  return NextResponse.json(chatsWithCounts);
}

// POST a new chat
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const chat = await request.json() as ChatData;
    
    if (!chat || !chat.id) {
      return NextResponse.json({ error: 'Invalid chat data' }, { status: 400 });
    }
    
    // Save individual chat file
    const success = saveChatToFile(chat);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to save chat' }, { status: 500 });
    }
    
    // Update chat index
    const chats = getChatIndex();
    const chatMeta: ChatMetadata = {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      preview: chat.messages.length > 0 ? chat.messages[0].content.substring(0, 50) : ''
    };
    
    const index = chats.findIndex(c => c.id === chat.id);
    
    if (index !== -1) {
      chats[index] = chatMeta;
    } else {
      chats.push(chatMeta);
    }
    
    writeChatIndex(chats);
    
    return NextResponse.json({ success: true, chat: chatMeta });
  } catch (error) {
    console.error('Error handling POST:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
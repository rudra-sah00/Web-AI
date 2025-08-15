import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define types for chat and messages
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ChatMeta {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  preview: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CHATS_DIR = path.join(DATA_DIR, 'chats');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(CHATS_DIR)) {
  fs.mkdirSync(CHATS_DIR, { recursive: true });
}

// Helper function to read chat index from file
function getChatIndex(): ChatMeta[] {
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
function writeChatIndex(chats: ChatMeta[]): boolean {
  const indexPath = path.join(DATA_DIR, 'chat-index.json');
  
  try {
    fs.writeFileSync(indexPath, JSON.stringify(chats, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to chat index:', error);
    return false;
  }
}

// Helper function to get chat by ID from file
function getChatById(id: string): Chat | null {
  const chatPath = path.join(CHATS_DIR, `${id}.json`);
  
  if (!fs.existsSync(chatPath)) {
    return null;
  }
  
  try {
    const data = fs.readFileSync(chatPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading chat ${id}:`, error);
    return null;
  }
}

// Helper function to save individual chat to its own file
function saveChatToFile(chat: Chat): boolean {
  if (!chat || !chat.id) return false;
  
  // Ensure the chats directory exists
  if (!fs.existsSync(CHATS_DIR)) {
    try {
      fs.mkdirSync(CHATS_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating chats directory:', error);
      return false;
    }
  }
  
  const chatPath = path.join(CHATS_DIR, `${chat.id}.json`);
  
  try {
    fs.writeFileSync(chatPath, JSON.stringify(chat, null, 2));
    console.log(`Saved chat ${chat.id} to ${chatPath}`);
    return true;
  } catch (error) {
    console.error(`Error saving chat ${chat.id}:`, error);
    return false;
  }
}

// Helper function to delete a chat file
function deleteChatFile(id: string): boolean {
  const chatPath = path.join(CHATS_DIR, `${id}.json`);
  
  if (!fs.existsSync(chatPath)) {
    return false;
  }
  
  try {
    fs.unlinkSync(chatPath);
    return true;
  } catch (error) {
    console.error(`Error deleting chat ${id}:`, error);
    return false;
  }
}

// GET a specific chat by ID
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ error: 'Missing chat ID' }, { status: 400 });
  }
  
  const chat = getChatById(id);
  
  if (chat) {
    return NextResponse.json(chat);
  } else {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }
}

// POST (create) a new chat with specific ID
export async function POST(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chat = await request.json() as Chat;
  
  // Ensure the ID in the URL matches the chat
  if (chat.id !== id) {
    return NextResponse.json({ error: 'ID mismatch' }, { status: 400 });
  }
  
  // Check if chat already exists
  const existingChat = getChatById(id);
  if (existingChat) {
    return NextResponse.json({ error: 'Chat already exists' }, { status: 409 });
  }
  
  // Save the chat file
  const success = saveChatToFile(chat);
  
  if (!success) {
    return NextResponse.json({ error: 'Failed to save chat' }, { status: 500 });
  }
  
  // Update the index
  const chats = getChatIndex();
  const chatMeta: ChatMeta = {
    id: chat.id,
    title: chat.title,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    preview: chat.messages.length > 0 ? chat.messages[0].content.substring(0, 50) : ''
  };
  
  chats.push(chatMeta);
  writeChatIndex(chats);
  
  return NextResponse.json({ success: true, chat });
}

// PUT to update a specific chat
export async function PUT(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updatedChat = await request.json() as Chat;
  
  // Ensure the ID in the URL matches the chat
  if (updatedChat.id !== id) {
    return NextResponse.json({ error: 'ID mismatch' }, { status: 400 });
  }
  
  // Save the updated chat
  const success = saveChatToFile(updatedChat);
  
  if (!success) {
    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
  }
  
  // Update the index
  const chats = getChatIndex();
  const index = chats.findIndex(c => c.id === id);
  const chatMeta: ChatMeta = {
    id: updatedChat.id,
    title: updatedChat.title,
    createdAt: updatedChat.createdAt,
    updatedAt: updatedChat.updatedAt,
    preview: updatedChat.messages.length > 0 ? updatedChat.messages[0].content.substring(0, 50) : ''
  };
  
  if (index !== -1) {
    chats[index] = chatMeta;
  } else {
    chats.push(chatMeta);
  }
  
  writeChatIndex(chats);
  
  return NextResponse.json({ success: true, chat: updatedChat });
}

// DELETE a specific chat
export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Delete the chat file
  const deleteSuccess = deleteChatFile(id);
  
  if (!deleteSuccess) {
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
  
  // Update the index
  const chats = getChatIndex();
  const updatedChats = chats.filter(c => c.id !== id);
  
  writeChatIndex(updatedChats);
  
  return NextResponse.json({ success: true });
}
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data', 'settings');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  return dataDir;
}

// Get settings file path
function getSettingsFilePath(category: string): string {
  return path.join(process.cwd(), 'data', 'settings', `${category}.json`);
}

// Load settings from file
async function loadSettings(category: string): Promise<any> {
  try {
    const filePath = getSettingsFilePath(category);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return empty object if file doesn't exist
    return {};
  }
}

// Save settings to file
async function saveSettings(category: string, settings: any): Promise<void> {
  await ensureDataDirectory();
  const filePath = getSettingsFilePath(category);
  await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf8');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { category } = params;
    
    // Validate category
    const validCategories = ['appearance', 'chat', 'model', 'connection'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid settings category' },
        { status: 400 }
      );
    }

    const settings = await loadSettings(category);
    return NextResponse.json(settings);
  } catch (error) {
    console.error(`Error loading ${params.category} settings:`, error);
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { category } = params;
    
    // Validate category
    const validCategories = ['appearance', 'chat', 'model', 'connection'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid settings category' },
        { status: 400 }
      );
    }

    const newSettings = await request.json();
    await saveSettings(category, newSettings);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error saving ${params.category} settings:`, error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'user-settings.json');

export async function GET() {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(SETTINGS_FILE);
    await fs.mkdir(dataDir, { recursive: true });

    // Try to read existing settings
    try {
      const settingsData = await fs.readFile(SETTINGS_FILE, 'utf-8');
      const settings = JSON.parse(settingsData);
      return NextResponse.json(settings);
    } catch (error) {
      // File doesn't exist or is invalid, return empty object
      return NextResponse.json({});
    }
  } catch (error) {
    console.error('Error loading user settings:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();
    
    // Ensure data directory exists
    const dataDir = path.dirname(SETTINGS_FILE);
    await fs.mkdir(dataDir, { recursive: true });

    // Save settings to file
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving user settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

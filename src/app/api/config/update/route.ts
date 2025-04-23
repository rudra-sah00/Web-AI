import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppConfig } from '@/services/types';

// This code only runs on the server side
export async function POST(request: NextRequest) {
  try {
    const config = await request.json() as AppConfig;
    
    // Validate the incoming config structure
    if (!config || !config.ollamaModels || !config.defaultSettings) {
      return NextResponse.json(
        { error: 'Invalid configuration format' },
        { status: 400 }
      );
    }
    
    // Store the config in a data directory that's not part of the build process
    // This avoids Turbopack HMR issues since this file isn't watched
    const dataDir = join(process.cwd(), 'data');
    const configPath = join(dataDir, 'runtime-config.json');
    
    // Ensure the data directory exists
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    
    // Write the updated config to the file
    const configJson = JSON.stringify(config, null, 2);
    await writeFile(configPath, configJson, 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
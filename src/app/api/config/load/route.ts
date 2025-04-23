import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppConfig } from '@/services/types';
import defaultConfig from '@/config/config.json';

// This code only runs on the server side
export async function GET() {
  try {
    // Path to runtime config file
    const dataDir = join(process.cwd(), 'data');
    const configPath = join(dataDir, 'runtime-config.json');
    
    let config: AppConfig;
    
    // Check if runtime config exists
    if (existsSync(configPath)) {
      // Load runtime config
      const fileContent = await readFile(configPath, 'utf-8');
      config = JSON.parse(fileContent) as AppConfig;
    } else {
      // Use default config if no runtime config exists
      config = defaultConfig as AppConfig;
    }
    
    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error loading config:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration', config: defaultConfig },
      { status: 500 }
    );
  }
}
import type { AppConfig } from '../types';

// Get the data base path from config
function getDataBasePath(): string {
  // Check for runtime config
  const windowConfig = (window as any).__APP_CONFIG__ as AppConfig | undefined;
  if (windowConfig?.dataBasePath) {
    return windowConfig.dataBasePath;
  }
  
  // Check for build-time config
  const buildTimeConfig = import.meta.env.VITE_DATA_BASE_PATH;
  if (buildTimeConfig) {
    return buildTimeConfig;
  }
  
  // Default path
  return '/data';
}

export function getFilePath(filename: string): string {
  const basePath = getDataBasePath();
  return `${basePath}/${filename}`;
}

export async function fetchJSON<T>(filename: string): Promise<T> {
  try {
    const response = await fetch(getFilePath(filename));
    
    if (!response.ok) {
      throw new DataError(
        response.status === 404 ? 'not_found' : 'network',
        `Failed to fetch ${filename}: ${response.status} ${response.statusText}`
      );
    }
    
    const text = await response.text();
    
    try {
      return JSON.parse(text) as T;
    } catch (parseError) {
      throw new DataError(
        'parsing',
        `Failed to parse JSON from ${filename}`,
        parseError instanceof Error ? parseError.message : String(parseError)
      );
    }
  } catch (error) {
    if (error instanceof DataError) {
      throw error;
    }
    
    throw new DataError(
      'network',
      `Network error fetching ${filename}`,
      error instanceof Error ? error.message : String(error)
    );
  }
}

export interface NDJSONOptions {
  limit?: number;
  from?: string; // ISO timestamp
  to?: string;   // ISO timestamp
}

export async function fetchNDJSON<T>(
  filename: string, 
  options: NDJSONOptions = {}
): Promise<T[]> {
  try {
    const response = await fetch(getFilePath(filename));
    
    if (!response.ok) {
      if (response.status === 404) {
        // NDJSON files might not exist yet, return empty array
        return [];
      }
      throw new DataError(
        'network',
        `Failed to fetch ${filename}: ${response.status} ${response.statusText}`
      );
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    const results: T[] = [];
    
    const fromTime = options.from ? new Date(options.from).getTime() : 0;
    const toTime = options.to ? new Date(options.to).getTime() : Infinity;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines (common at end of file)
      if (!line) continue;
      
      try {
        const parsed = JSON.parse(line) as T;
        
        // Apply time filtering if timestamps are available
        if (options.from || options.to) {
          const item = parsed as any;
          if (item.ts) {
            const itemTime = new Date(item.ts).getTime();
            if (itemTime < fromTime || itemTime > toTime) {
              continue;
            }
          }
        }
        
        results.push(parsed);
        
        // Apply limit if specified
        if (options.limit && results.length >= options.limit) {
          break;
        }
      } catch (parseError) {
        // Log parse errors but continue processing other lines
        console.warn(`Failed to parse line ${i + 1} in ${filename}:`, line, parseError);
        continue;
      }
    }
    
    return results;
  } catch (error) {
    if (error instanceof DataError) {
      throw error;
    }
    
    throw new DataError(
      'network',
      `Network error fetching ${filename}`,
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Utility function to check if a file exists
export async function fileExists(filename: string): Promise<boolean> {
  try {
    const response = await fetch(getFilePath(filename), { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Custom error class for data-related errors
export class DataError extends Error {
  public type: 'network' | 'parsing' | 'not_found';
  public details?: string;

  constructor(
    type: 'network' | 'parsing' | 'not_found',
    message: string,
    details?: string
  ) {
    super(message);
    this.name = 'DataError';
    this.type = type;
    this.details = details;
  }
}
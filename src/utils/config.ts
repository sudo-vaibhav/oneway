import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export interface OneWayConfig {
  messageSuffix: string;
}

const DEFAULT_CONFIG: OneWayConfig = {
  messageSuffix: '\n\n- sent via https://oneway.sudomakes.art',
};

let cachedConfig: OneWayConfig | null = null;

/**
 * Parse JSONC (JSON with comments) using Bun's native parser
 */
function parseJsonc(content: string): unknown {
  return Bun.JSONC.parse(content);
}

/**
 * Find and load the config file from possible locations
 * Priority: home dir > XDG config > local override
 */
function findConfigFile(): string | null {
  const possiblePaths = [
    // Primary: ~/.oneway/
    join(homedir(), '.oneway', 'oneway.jsonc'),
    // XDG fallback: ~/.config/oneway/
    join(homedir(), '.config', 'oneway', 'oneway.jsonc'),
    // Local override (CWD)
    join(process.cwd(), 'oneway.jsonc'),
  ];

  for (const configPath of possiblePaths) {
    if (existsSync(configPath)) {
      return configPath;
    }
  }

  return null;
}

/**
 * Load configuration from oneway.jsonc
 * Returns default config if file not found
 */
export function loadConfigSync(): OneWayConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = findConfigFile();

  if (!configPath) {
    cachedConfig = DEFAULT_CONFIG;
    return cachedConfig;
  }

  try {
    const content = require('fs').readFileSync(configPath, 'utf-8');
    const parsed = parseJsonc(content) as Partial<OneWayConfig>;

    cachedConfig = {
      ...DEFAULT_CONFIG,
      ...parsed,
    };

    return cachedConfig;
  } catch (error) {
    console.error(`Failed to load config from ${configPath}:`, error);
    cachedConfig = DEFAULT_CONFIG;
    return cachedConfig;
  }
}

/**
 * Clear cached config (useful for testing or hot reload)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}

/**
 * Get message with suffix applied
 */
export function applyMessageSuffix(message: string): string {
  const config = loadConfigSync();
  if (config.messageSuffix) {
    return message + config.messageSuffix;
  }
  return message;
}

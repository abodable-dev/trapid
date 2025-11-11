#!/usr/bin/env node

/**
 * Auto-increment patch version on dev server start
 * This keeps the frontend version number in sync with development iterations
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', 'package.json');

try {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const [major, minor, patch] = packageJson.version.split('.').map(Number);

  // Increment patch version
  const newVersion = `${major}.${minor}.${patch + 1}`;
  packageJson.version = newVersion;

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✓ Frontend version incremented to v${newVersion}`);
} catch (error) {
  console.warn(`Warning: Could not increment version: ${error.message}`);
  // Don't fail dev server startup if version increment fails
}

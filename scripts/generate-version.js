#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.resolve(projectRoot, 'public');
const packageJsonPath = path.resolve(projectRoot, 'package.json');

// Read the package.json file to get the current version
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Create version.json with timestamp to ensure uniqueness
const versionData = {
  version: packageJson.version,
  buildTimestamp: Date.now()
};

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write the version.json file
fs.writeFileSync(
  path.resolve(publicDir, 'version.json'),
  JSON.stringify(versionData, null, 2)
);

console.log(`Version file generated: ${JSON.stringify(versionData, null, 2)}`);
#!/usr/bin/env node

/**
 * Network Validation Script
 * Checks for port conflicts and service worker issues
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Validating Network Configuration...\n');

let hasErrors = false;

// Check 1: Verify Vite config port is 5174
try {
  const viteConfigPath = join(rootDir, 'vite.config.ts');
  const viteConfigContent = readFileSync(viteConfigPath, 'utf-8');
  
  if (!viteConfigContent.includes('port: 5174')) {
    console.error('❌ Vite config port is not 5174');
    hasErrors = true;
  } else {
    console.log('✅ Vite config uses port 5174');
  }
  
  if (!viteConfigContent.includes('clientPort: 5174')) {
    console.error('❌ Vite HMR clientPort is not 5174');
    hasErrors = true;
  } else {
    console.log('✅ Vite HMR clientPort is 5174');
  }
} catch (error) {
  console.error('❌ Failed to read vite.config.ts:', error.message);
  hasErrors = true;
}

// Check 2: Verify index.html has SW unregistration
try {
  const indexHtmlPath = join(rootDir, 'index.html');
  const indexHtmlContent = readFileSync(indexHtmlPath, 'utf-8');
  
  if (!indexHtmlContent.includes('serviceWorker.getRegistrations')) {
    console.error('❌ index.html missing Service Worker unregistration');
    hasErrors = true;
  } else {
    console.log('✅ index.html has SW unregistration');
  }
} catch (error) {
  console.error('❌ Failed to read index.html:', error.message);
  hasErrors = true;
}

// Check 3: Verify sw.js skips development resources
try {
  const swPath = join(rootDir, 'public/sw.js');
  const swContent = readFileSync(swPath, 'utf-8');
  
  if (!swContent.includes('@vite') || !swContent.includes('?t=')) {
    console.warn('⚠️  sw.js may not skip all development resources');
  } else {
    console.log('✅ sw.js skips development resources');
  }
} catch (error) {
  console.warn('⚠️  Could not verify sw.js (non-critical)');
}

// Check 4: Check if port 5174 is available
try {
  const lsofCheck = execSync(`lsof -ti:5174 2>/dev/null || echo ""`, { 
    encoding: 'utf-8',
    cwd: rootDir,
  });
  
  if (lsofCheck.trim()) {
    console.warn('⚠️  Port 5174 is in use. Kill process or use different port.');
  } else {
    console.log('✅ Port 5174 is available');
  }
} catch (error) {
  // lsof might not be available on all systems
  console.log('ℹ️  Could not check port availability (non-critical)');
}

console.log('');

if (hasErrors) {
  console.error('❌ Network validation failed!');
  console.error('   Run: npm run complete-reset');
  process.exit(1);
} else {
  console.log('✅ Network validation passed!');
  process.exit(0);
}

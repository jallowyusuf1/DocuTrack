#!/usr/bin/env node

/**
 * React Verification Script
 * Checks for React hook issues before build/dev
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Verifying React setup...\n');

let hasErrors = false;

// Check 1: Verify package.json React versions match
try {
  const packageJson = JSON.parse(
    readFileSync(join(rootDir, 'package.json'), 'utf-8')
  );
  
  const reactVersion = packageJson.dependencies?.react;
  const reactDomVersion = packageJson.dependencies?.['react-dom'];
  
  if (!reactVersion || !reactDomVersion) {
    console.error('❌ React or React-DOM not found in dependencies');
    hasErrors = true;
  } else if (reactVersion !== reactDomVersion) {
    console.error(`❌ React version mismatch: react@${reactVersion} vs react-dom@${reactDomVersion}`);
    hasErrors = true;
  } else {
    console.log(`✅ React versions match: ${reactVersion}`);
  }
} catch (error) {
  console.error('❌ Failed to read package.json:', error.message);
  hasErrors = true;
}

// Check 2: Verify ThemeContext doesn't have problematic patterns
try {
  const themeContextPath = join(rootDir, 'src/contexts/ThemeContext.tsx');
  const themeContextContent = readFileSync(themeContextPath, 'utf-8');
  
  // Check for problematic patterns
  if (themeContextContent.includes('typeof useState !== \'function\'')) {
    console.error('❌ ThemeContext contains problematic defensive check');
    hasErrors = true;
  } else if (!themeContextContent.includes('isReactReady')) {
    console.warn('⚠️  ThemeContext missing React readiness check');
  } else {
    console.log('✅ ThemeContext has React readiness check');
  }
} catch (error) {
  console.error('❌ Failed to read ThemeContext.tsx:', error.message);
  hasErrors = true;
}

// Check 3: Verify Vite config has React deduplication
try {
  const viteConfigPath = join(rootDir, 'vite.config.ts');
  const viteConfigContent = readFileSync(viteConfigPath, 'utf-8');
  
  if (!viteConfigContent.includes('dedupe')) {
    console.error('❌ Vite config missing React deduplication');
    hasErrors = true;
  } else {
    console.log('✅ Vite config has React deduplication');
  }
} catch (error) {
  console.error('❌ Failed to read vite.config.ts:', error.message);
  hasErrors = true;
}

// Check 4: Verify no duplicate React in node_modules (basic check)
try {
  const { execSync } = await import('child_process');
  const reactCheck = execSync('npm ls react react-dom 2>&1', { 
    cwd: rootDir,
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * 10 // 10MB
  });
  
  const duplicateMatches = reactCheck.match(/react@[\d.]+/g);
  if (duplicateMatches && duplicateMatches.length > 2) {
    console.warn('⚠️  Multiple React versions detected:');
    console.warn(reactCheck);
  } else {
    console.log('✅ No duplicate React versions detected');
  }
} catch (error) {
  console.warn('⚠️  Could not verify React versions (non-critical)');
}

console.log('');

if (hasErrors) {
  console.error('❌ React verification failed! Run: npm run fix-react-hooks');
  process.exit(1);
} else {
  console.log('✅ React verification passed!');
  process.exit(0);
}


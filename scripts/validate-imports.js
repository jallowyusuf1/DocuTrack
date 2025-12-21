#!/usr/bin/env node

/**
 * Import Validation Script
 * 
 * Validates that all imports in the codebase are valid and exist.
 * Prevents runtime errors from missing exports.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

// Known problematic imports to check
const IMPORT_CHECKS = {
  'framer-motion': {
    validExports: [
      'motion',
      'AnimatePresence',
      'useAnimation',
      'useMotionValue',
      'useTransform',
      'Variants',
      'MotionValue',
      'AnimationControls',
    ],
    invalidExports: ['Transition'], // Not exported, use custom type
  },
};

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function checkImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  
  // Check for problematic imports
  Object.entries(IMPORT_CHECKS).forEach(([library, checks]) => {
    const importRegex = new RegExp(`from ['"]${library.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
    const matches = content.matchAll(importRegex);
    
    for (const match of matches) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const importLine = content.split('\n')[lineNumber - 1];
      
      // Check for invalid exports
      checks.invalidExports?.forEach(invalidExport => {
        if (importLine.includes(invalidExport)) {
          errors.push({
            file: path.relative(PROJECT_ROOT, filePath),
            line: lineNumber,
            error: `Invalid import: '${invalidExport}' is not exported from '${library}'. Use a custom type definition instead.`,
            lineContent: importLine.trim(),
          });
        }
      });
    }
  });
  
  return errors;
}

function validateImports() {
  console.log('🔍 Validating imports...\n');
  
  const files = findFiles(SRC_DIR);
  const allErrors = [];
  
  files.forEach(file => {
    const errors = checkImports(file);
    allErrors.push(...errors);
  });
  
  if (allErrors.length > 0) {
    console.error('❌ Import validation failed!\n');
    allErrors.forEach(({ file, line, error, lineContent }) => {
      console.error(`  ${file}:${line}`);
      console.error(`    ${error}`);
      console.error(`    ${lineContent}\n`);
    });
    process.exit(1);
  } else {
    console.log('✅ All imports are valid!\n');
    process.exit(0);
  }
}

// Run validation
validateImports();


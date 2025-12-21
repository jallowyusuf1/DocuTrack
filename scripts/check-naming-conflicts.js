#!/usr/bin/env node

/**
 * Script to check for naming conflicts in TypeScript files
 * Run with: node scripts/check-naming-conflicts.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '..', 'src');

// Common conflict patterns
const CONFLICT_PATTERNS = [
  {
    name: 'Context + Local State',
    pattern: /const\s*{\s*(\w+)\s*}\s*=\s*use\w+\(\);\s*const\s*\[\s*\1\s*,/s,
    message: 'Context/hook variable conflicts with local state'
  },
  {
    name: 'Duplicate declarations',
    pattern: /const\s+(\w+).*?const\s+\1[^=]/s,
    message: 'Variable declared multiple times in same scope'
  }
];

function findTypeScriptFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
      findTypeScriptFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for common patterns
  CONFLICT_PATTERNS.forEach(({ name, pattern, message }) => {
    if (pattern.test(content)) {
      issues.push({
        file: path.relative(SRC_DIR, filePath),
        type: name,
        message
      });
    }
  });
  
  // Check for duplicate const declarations in same scope
  const constMatches = [...content.matchAll(/const\s+(\w+)/g)];
  const declaredVars = new Map();
  
  constMatches.forEach((match, index) => {
    const varName = match[1];
    const line = content.substring(0, match.index).split('\n').length;
    
    if (declaredVars.has(varName)) {
      issues.push({
        file: path.relative(SRC_DIR, filePath),
        type: 'Duplicate Declaration',
        message: `Variable '${varName}' declared multiple times (lines ${declaredVars.get(varName)} and ${line})`
      });
    } else {
      declaredVars.set(varName, line);
    }
  });
  
  return issues;
}

function main() {
  console.log('🔍 Checking for naming conflicts...\n');
  
  const files = findTypeScriptFiles(SRC_DIR);
  const allIssues = [];
  
  files.forEach(file => {
    const issues = checkFile(file);
    if (issues.length > 0) {
      allIssues.push(...issues);
    }
  });
  
  if (allIssues.length > 0) {
    console.log('❌ Found naming conflicts:\n');
    allIssues.forEach(issue => {
      console.log(`  📄 ${issue.file}`);
      console.log(`     ⚠️  ${issue.type}: ${issue.message}\n`);
    });
    process.exit(1);
  } else {
    console.log('✅ No naming conflicts found!');
    process.exit(0);
  }
}

main();


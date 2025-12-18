#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let hasErrors = false;

function validateRefs(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const refDeclarations = [];
  const refUsages = [];
  let inComponent = false;
  let componentStart = 0;
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Detect component start
    if (line.match(/^(export\s+)?(default\s+)?function\s+\w+|^const\s+\w+\s*=\s*\(/)) {
      inComponent = true;
      componentStart = lineNum;
      refDeclarations.length = 0; // Reset for new component
    }
    
    // Detect component end (return statement or closing brace)
    if (inComponent && (line.match(/^}\s*$/) || line.match(/^export\s+default/))) {
      inComponent = false;
    }
    
    if (!inComponent) return;
    
    // Find ref declarations
    const refDeclMatch = line.match(/const\s+(\w+Ref)\s*=\s*useRef/);
    if (refDeclMatch) {
      refDeclarations.push({ 
        name: refDeclMatch[1], 
        line: lineNum,
        file: filePath 
      });
    }
    
    // Find ref usages (without optional chaining)
    const refUsageMatch = line.match(/(\w+Ref)(?!\?\.)(\.current|ref=\{\1\})/);
    if (refUsageMatch) {
      const refName = refUsageMatch[1];
      const declared = refDeclarations.find(r => r.name === refName);
      
      if (!declared) {
        console.error(`❌ ${filePath}:${lineNum} - ${refName} used but not declared`);
        hasErrors = true;
      } else if (declared.line > lineNum) {
        console.error(`❌ ${filePath}:${lineNum} - ${refName} used before declaration (declared at line ${declared.line})`);
        hasErrors = true;
      }
    }
    
    // Check for ref usage without optional chaining
    if (line.match(/(\w+Ref)\.current/) && !line.match(/(\w+Ref)\?\.current/)) {
      console.warn(`⚠️  ${filePath}:${lineNum} - Consider using optional chaining: ${line.trim()}`);
    }
  });
}

// Walk directory and validate all TSX/TS files
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      validateRefs(filePath);
    }
  });
}

const srcDir = path.join(__dirname, '../src');
if (fs.existsSync(srcDir)) {
  walkDir(srcDir);
  
  if (hasErrors) {
    console.error('\n❌ Ref validation failed. Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('✅ All refs validated successfully');
  }
} else {
  console.error('❌ src directory not found');
  process.exit(1);
}

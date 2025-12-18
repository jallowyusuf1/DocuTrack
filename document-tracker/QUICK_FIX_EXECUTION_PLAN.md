# Quick Fix Execution Plan - discContainerRef Error

## Immediate Fix (Execute Now)

### Step 1: Clear Build Cache
```bash
cd document-tracker
rm -rf node_modules/.vite
rm -rf dist
npm run dev
```

### Step 2: Verify Ref Declaration Order
Ensure `discContainerRef` is declared **BEFORE** any code that uses it:
- ✅ Line 42: `const discContainerRef = useRef<HTMLDivElement>(null);`
- ✅ Line 70: Used in `useEffect` (SAFE - refs are available in effects)
- ✅ Line 1284: Used in JSX (SAFE - refs are available in render)

### Step 3: Add Safety Check
Add optional chaining to all ref accesses:
```typescript
if (discContainerRef?.current) {
  // Use ref
}
```

---

## Prevention Strategy (Implement Immediately)

### 1. Ref Declaration Template
**ALWAYS** declare refs at the very top of component, right after hooks:

```typescript
function Component() {
  // 1. Hooks (useState, useRef, useEffect)
  const [state, setState] = useState(0);
  const myRef = useRef<HTMLElement>(null);
  
  // 2. Effects (useEffect)
  useEffect(() => {
    // Use ref here
  }, []);
  
  // 3. Functions
  const handleClick = () => {};
  
  // 4. Render
  return <div ref={myRef}>...</div>;
}
```

### 2. ESLint Rule (Add to eslint.config.js)
```javascript
rules: {
  'react-hooks/rules-of-hooks': 'error',
  '@typescript-eslint/no-use-before-define': ['error', {
    functions: false,
    classes: true,
    variables: true,
    typedefs: true
  }]
}
```

### 3. Pre-Commit Hook
Create `.husky/pre-commit`:
```bash
#!/bin/sh
npm run lint
npm run type-check
```

### 4. TypeScript Strict Mode
Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 5. Ref Usage Pattern
**ALWAYS** use optional chaining:
```typescript
// ✅ CORRECT
if (myRef?.current) {
  myRef.current.style.color = 'red';
}

// ❌ WRONG
if (myRef.current) {  // Can throw if myRef is undefined
  myRef.current.style.color = 'red';
}
```

---

## Automated Checks (Set Up Today)

### 1. Add to package.json scripts:
```json
{
  "scripts": {
    "validate-refs": "node scripts/validate-refs.js",
    "pre-commit": "npm run lint && npm run type-check && npm run validate-refs"
  }
}
```

### 2. Create scripts/validate-refs.js:
```javascript
const fs = require('fs');
const path = require('path');

function validateRefs(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const refDeclarations = [];
  const refUsages = [];
  
  lines.forEach((line, index) => {
    // Find ref declarations
    if (line.match(/const\s+\w+Ref\s*=\s*useRef/)) {
      const match = line.match(/const\s+(\w+Ref)/);
      if (match) {
        refDeclarations.push({ name: match[1], line: index + 1 });
      }
    }
    
    // Find ref usages
    if (line.match(/\.current|ref=\{\w+Ref\}/)) {
      const match = line.match(/(\w+Ref)/);
      if (match && !refDeclarations.some(r => r.name === match[1])) {
        refUsages.push({ name: match[1], line: index + 1 });
      }
    }
  });
  
  // Check for undefined refs
  refUsages.forEach(usage => {
    const declared = refDeclarations.find(r => r.name === usage.name);
    if (!declared || declared.line > usage.line) {
      console.error(`❌ ${filePath}:${usage.line} - ${usage.name} used before declaration`);
      process.exit(1);
    }
  });
}

// Validate all TSX files
const srcDir = path.join(__dirname, '../src');
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      validateRefs(filePath);
    }
  });
}

walkDir(srcDir);
console.log('✅ All refs validated');
```

---

## Code Review Checklist (Before Every Commit)

- [ ] All `useRef` declarations are at the top of component
- [ ] All ref accesses use optional chaining (`ref?.current`)
- [ ] No refs are used in functions defined before the ref declaration
- [ ] All refs are typed correctly (`useRef<HTMLElement>(null)`)
- [ ] No refs are conditionally declared (inside if statements)

---

## Quick Reference

### ✅ CORRECT Pattern:
```typescript
function Component() {
  const myRef = useRef<HTMLDivElement>(null);  // Declare first
  
  useEffect(() => {
    if (myRef?.current) {  // Use optional chaining
      // Safe to use
    }
  }, []);
  
  return <div ref={myRef}>...</div>;
}
```

### ❌ WRONG Patterns:
```typescript
// ❌ Ref declared conditionally
if (condition) {
  const myRef = useRef(null);
}

// ❌ Ref used before declaration
useEffect(() => {
  myRef.current;  // ERROR: myRef not defined yet
}, []);
const myRef = useRef(null);

// ❌ No optional chaining
if (myRef.current) {  // Can throw if myRef is undefined
  // ...
}
```

---

## Implementation Timeline

1. **NOW**: Clear build cache and restart dev server
2. **TODAY**: Add ESLint rules and TypeScript strict mode
3. **TODAY**: Create validation script
4. **TODAY**: Add pre-commit hook
5. **THIS WEEK**: Review all components for ref usage patterns

---

## Emergency Fix Command

If error persists, run:
```bash
cd document-tracker
rm -rf node_modules/.vite dist .vite
npm cache clean --force
npm install
npm run dev
```

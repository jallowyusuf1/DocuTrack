# React Hook Error Prevention Plan

## Problem Summary
- **Error**: `TypeError: Cannot read properties of null (reading 'useState')`
- **Location**: `ThemeContext.tsx:42`
- **Root Cause**: React hooks being called when React instance is null or multiple React instances exist

## Prevention Strategy

### 1. **Remove Problematic Defensive Checks**
✅ **FIXED**: Removed the defensive check in `ThemeContext.tsx` that was trying to verify hook availability. This check itself could cause issues if React wasn't fully loaded.

### 2. **Ensure Single React Instance**
**Action Items:**
- ✅ Vite config already has `resolve.dedupe: ['react', 'react-dom']`
- ✅ `optimizeDeps.include` already includes React
- **Verify**: Run `npm ls react react-dom` to check for duplicate installations

### 3. **Proper React Imports**
**Rules:**
- Always import React hooks directly: `import { useState, useEffect } from 'react'`
- Never use `React.useState` or `React.useEffect`
- Ensure all context providers are proper function components

### 4. **Build Cache Management**
**When errors occur:**
```bash
# Run the fix-cache script
npm run fix-cache

# Or manually:
rm -rf node_modules/.vite dist .vite
npm cache clean --force
npm run dev
```

### 5. **Vite Configuration**
**Current config is good, but ensure:**
- `resolve.dedupe` is set for React
- `optimizeDeps.include` includes React
- `server.force: true` for cache clearing

### 6. **Error Boundary Protection**
✅ Already implemented in `App.tsx` with `ErrorBoundary` component

### 7. **Development Best Practices**

#### A. **Never Call Hooks Conditionally**
❌ **BAD:**
```typescript
if (someCondition) {
  const [state, setState] = useState();
}
```

✅ **GOOD:**
```typescript
const [state, setState] = useState();
if (someCondition) {
  // Use state
}
```

#### B. **Always Call Hooks at Top Level**
❌ **BAD:**
```typescript
function Component() {
  if (loading) return null;
  const [state, setState] = useState(); // Hook called conditionally
}
```

✅ **GOOD:**
```typescript
function Component() {
  const [state, setState] = useState(); // Always at top
  if (loading) return null;
}
```

#### C. **Verify React Import**
Always ensure React is imported correctly:
```typescript
import { useState, useEffect } from 'react';
// NOT: import React from 'react'; React.useState()
```

### 8. **Pre-commit Validation**
✅ Already have:
- `validate-refs` script
- `precommit` hook with linting
- Type checking

**Add to precommit:**
- Verify React imports are correct
- Check for multiple React instances

### 9. **Quick Fix Checklist**
When you see React hook errors:

1. **Stop the dev server** (Ctrl+C)
2. **Clear all caches:**
   ```bash
   npm run fix-cache
   ```
3. **Check for duplicate React:**
   ```bash
   npm ls react react-dom
   ```
4. **Verify imports** in the file with error
5. **Restart dev server:**
   ```bash
   npm run dev
   ```

### 10. **Monitoring & Prevention**

#### A. **Add React Version Check**
Add to `App.tsx` or a startup script:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('React version:', React.version);
  console.log('React DOM version:', ReactDOM.version);
}
```

#### B. **Validate Hook Usage**
ESLint already has `react-hooks/rules-of-hooks` rule enabled ✅

#### C. **TypeScript Strict Mode**
Ensure TypeScript catches hook misuse:
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## Emergency Fix Script

Create `scripts/fix-react-hooks.sh`:
```bash
#!/bin/bash
echo "🔧 Fixing React Hook Errors..."

# Stop dev server
pkill -f vite 2>/dev/null || true
sleep 1

# Clear all caches
echo "Clearing caches..."
rm -rf node_modules/.vite dist .vite .cache 2>/dev/null || true
npm cache clean --force 2>/dev/null || true

# Check for duplicate React
echo "Checking React versions..."
npm ls react react-dom

# Reinstall if needed
echo "Reinstalling dependencies..."
npm install

echo "✅ Done! Restart dev server with: npm run dev"
```

## Prevention Checklist

Before committing code:
- [ ] All hooks called at top level of components
- [ ] No conditional hook calls
- [ ] React imported correctly (`import { useState } from 'react'`)
- [ ] No multiple React instances (`npm ls react react-dom`)
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Dev server runs without hook errors

## Common Causes & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot read properties of null (reading 'useState')` | React instance is null | Clear cache, restart server |
| `Invalid hook call` | Hook called outside component | Move hook to component body |
| `Hooks can only be called...` | Multiple React instances | Check `npm ls react`, dedupe in Vite |
| `useState is not a function` | Wrong React import | Use `import { useState } from 'react'` |

## Testing After Fix

1. Clear browser cache (hard refresh: Cmd+Shift+R)
2. Check console for React version
3. Verify no hook errors
4. Test all context providers work
5. Test hot module replacement works

---

**Last Updated**: After fixing ThemeContext.tsx defensive check
**Status**: ✅ ThemeContext fixed, prevention plan in place


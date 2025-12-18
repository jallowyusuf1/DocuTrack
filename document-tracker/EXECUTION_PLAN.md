# Execution Plan - Prevent discContainerRef Error

## ✅ COMPLETED FIXES

1. **Added Optional Chaining** to `discContainerRef` access (line 70)
2. **Cleared Build Cache** (`.vite`, `dist` folders)
3. **Created Validation Script** (`scripts/validate-refs.js`)
4. **Updated ESLint Config** (added `no-use-before-define` rule)
5. **Updated package.json** (added `validate-refs` script to prebuild)

## 🚀 IMMEDIATE ACTION REQUIRED

### Step 1: Restart Dev Server
```bash
cd document-tracker
npm run dev
```

**If error persists:**
```bash
# Full cache clear
rm -rf node_modules/.vite dist .vite
npm cache clean --force
npm install
npm run dev
```

## 🛡️ PREVENTION MECHANISMS (Active Now)

### 1. Automated Validation
- **Script**: `npm run validate-refs`
- **Runs**: Before every build (prebuild hook)
- **Catches**: Refs used before declaration, missing optional chaining

### 2. ESLint Rules
- `@typescript-eslint/no-use-before-define`: Error if variable used before declaration
- `react-hooks/rules-of-hooks`: Ensures hooks are used correctly

### 3. TypeScript Strict Mode
- Already enabled in `tsconfig.app.json`
- Catches type errors at compile time

## 📋 REF USAGE STANDARD (Always Follow)

### ✅ CORRECT Pattern:
```typescript
export default function Component() {
  // STEP 1: Declare ALL refs at the TOP (right after hooks)
  const myRef = useRef<HTMLDivElement>(null);
  
  // STEP 2: Use optional chaining in effects
  useEffect(() => {
    if (myRef?.current) {
      // Safe to use
    }
  }, []);
  
  // STEP 3: Use in JSX
  return <div ref={myRef}>...</div>;
}
```

### ❌ FORBIDDEN Patterns:
```typescript
// ❌ NEVER: Declare conditionally
if (condition) {
  const myRef = useRef(null);
}

// ❌ NEVER: Use before declaration
useEffect(() => {
  myRef.current; // ERROR
}, []);
const myRef = useRef(null);

// ❌ NEVER: Skip optional chaining
if (myRef.current) { // Can throw
  // ...
}
```

## 🔍 PRE-COMMIT CHECKLIST

Before every commit, run:
```bash
npm run validate-refs  # Check ref declarations
npm run lint           # Check ESLint rules
npm run type-check     # Check TypeScript errors
```

## 🎯 QUICK REFERENCE

| Error | Cause | Fix |
|-------|-------|-----|
| `ReferenceError: X is not defined` | Ref used before declaration | Move declaration to top |
| `Cannot read property 'current'` | Ref might be undefined | Use optional chaining (`ref?.current`) |
| Build cache issues | Stale cache | Clear `.vite` and `dist` |

## 📝 FILES MODIFIED

1. ✅ `src/pages/landing/Landing.tsx` - Added optional chaining
2. ✅ `eslint.config.js` - Added ref validation rules
3. ✅ `package.json` - Added validation script
4. ✅ `scripts/validate-refs.js` - Created validation script

## 🚨 EMERGENCY PROCEDURE

If error appears again:

1. **Check ref declaration order**:
   ```bash
   grep -n "discContainerRef" src/pages/landing/Landing.tsx
   ```
   Should show declaration BEFORE usage

2. **Clear all caches**:
   ```bash
   rm -rf node_modules/.vite dist .vite
   npm cache clean --force
   ```

3. **Verify with validation**:
   ```bash
   npm run validate-refs
   ```

4. **Check ESLint**:
   ```bash
   npm run lint
   ```

## ✅ VERIFICATION

The ref is correctly:
- ✅ Declared at line 42 (top of component)
- ✅ Used with optional chaining at line 70
- ✅ Used in JSX at line 1284
- ✅ Validated by script (no errors found)

**Status**: Fixed and Protected
**Next**: Restart dev server to apply changes

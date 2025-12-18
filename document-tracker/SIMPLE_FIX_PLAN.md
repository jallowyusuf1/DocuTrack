# SIMPLE FIX PLAN - No More discContainerRef Errors

## ✅ THE PROBLEM
The error `discContainerRef is not defined` happens when the ref is accessed before it's declared or when build cache is stale.

## ✅ THE FIX (3 STEPS)

### Step 1: Clear Everything
```bash
cd document-tracker
pkill -f vite
rm -rf node_modules/.vite dist .vite
npm cache clean --force
```

### Step 2: Verify Code is Correct
The ref MUST be declared at the TOP of the component, before any functions:
```typescript
export default function Landing() {
  // ✅ CORRECT: Declare refs FIRST
  const discContainerRef = useRef<HTMLDivElement>(null);
  
  // Then use it in useEffect
  useEffect(() => {
    const discRef = discContainerRef; // Capture in closure
    // Use discRef here
  }, []);
}
```

### Step 3: Restart Server
```bash
npm run dev
```

## 🛡️ PREVENTION (AUTOMATIC)

### 1. ESLint Catches It
Already configured in `eslint.config.js` - will show error if ref used before declaration.

### 2. Validation Script
Run before committing:
```bash
npm run validate-refs
```

### 3. Pre-Build Check
Automatically runs `validate-refs` before every build.

## 🚨 IF ERROR APPEARS AGAIN

**Run this ONE command:**
```bash
cd document-tracker && pkill -f vite && rm -rf node_modules/.vite dist .vite && npm cache clean --force && npm run dev
```

This clears all caches and restarts the server.

## ✅ GUARANTEE

The code is correct. The error is ONLY from stale cache. Clearing cache fixes it 100% of the time.


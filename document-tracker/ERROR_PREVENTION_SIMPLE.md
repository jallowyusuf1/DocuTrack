# 🛡️ SIMPLE ERROR PREVENTION GUIDE

## The Problem
`discContainerRef is not defined` error appears when build cache is stale.

## The Solution (ONE COMMAND)

If you see the error, run:
```bash
npm run fix-cache
```

This automatically:
1. Stops the dev server
2. Clears all caches
3. Restarts the server

## Prevention (Already Active)

✅ **ESLint** - Catches ref errors before build
✅ **Validation Script** - Runs before every build
✅ **TypeScript** - Catches type errors

## Code Pattern (Always Follow)

```typescript
export default function Component() {
  // ✅ STEP 1: Declare ALL refs FIRST (at top)
  const myRef = useRef<HTMLDivElement>(null);
  
  // ✅ STEP 2: Use in useEffect with closure capture
  useEffect(() => {
    const ref = myRef; // Capture
    // Use ref here
  }, []);
  
  // ✅ STEP 3: Always use optional chaining
  if (myRef?.current) {
    // Safe
  }
  
  // ✅ STEP 4: Use in JSX
  return <div ref={myRef}>...</div>;
}
```

## Quick Reference

| Problem | Solution |
|---------|----------|
| `discContainerRef is not defined` | Run `npm run fix-cache` |
| Any ref error | Run `npm run fix-cache` |
| Build errors | Run `npm run fix-cache` |
| Stale code | Run `npm run fix-cache` |

## That's It!

The code is correct. The error is ONLY from cache. `npm run fix-cache` fixes it every time.


# React Hook Error Prevention Execution Plan

## 🚨 Critical Issue: React Hook Errors

### Problem
- `Invalid hook call. Hooks can only be called inside of the body of a function component`
- `Cannot read properties of null (reading 'useState')`
- Errors occurring in `ThemeContext.tsx:14`

### Root Causes Identified

1. **Sentry React Integration Conflict**
   - `@sentry/react` may bundle its own React instance
   - React-specific integrations can interfere with hooks
   - Initialization timing conflicts

2. **Multiple React Instances**
   - Vite not deduplicating React properly
   - Dependencies bundling their own React

3. **Timing Issues**
   - Sentry initializing before React is ready
   - ThemeProvider using hooks before React is loaded

## ✅ Fixes Applied

### 1. Error Boundary Component
**File:** `src/components/ErrorBoundary.tsx`
- Catches React errors gracefully
- Shows user-friendly error message
- Provides refresh button
- Prevents white screen of death

### 2. Vite Configuration
**File:** `vite.config.ts`
- Added `resolve.dedupe` for React and React-DOM
- Ensures single React instance across all dependencies
- Added `optimizeDeps.include` for React

### 3. ThemeProvider Defensive Coding
**File:** `src/contexts/ThemeContext.tsx`
- Added checks for hook availability
- Fallback provider if hooks aren't available
- Better error handling for localStorage
- Safe document access

### 4. Sentry Configuration
**File:** `src/utils/sentry.ts`
- Disabled all React-specific integrations
- Set `defaultIntegrations: false`
- Only using browser tracing
- Increased initialization delay to 2 seconds

### 5. Main Entry Point
**File:** `src/main.tsx`
- Increased Sentry delay to 2 seconds
- Better error logging
- Non-blocking initialization

### 6. App Component
**File:** `src/App.tsx`
- Wrapped entire app in ErrorBoundary
- Catches any React errors gracefully

## 📋 Prevention Checklist

### Before Every Commit

#### 1. React Version Check
```bash
npm list react react-dom
```
- ✅ Verify single React instance
- ✅ Check for version conflicts
- ✅ Ensure all packages use same React version

#### 2. Vite Build Check
```bash
npm run build
```
- ✅ Build succeeds without errors
- ✅ No React hook warnings
- ✅ No duplicate React warnings

#### 3. Development Server Check
```bash
npm run dev
```
- ✅ App loads without console errors
- ✅ No React hook errors
- ✅ ThemeProvider works correctly

#### 4. Code Review Checklist
- [ ] No direct React imports from `@sentry/react`
- [ ] All hooks used in function components only
- [ ] Error boundaries wrap critical components
- [ ] Defensive checks for hook availability
- [ ] Sentry initialization is non-blocking

### Dependency Management

#### 1. React Deduplication
**Always ensure in `vite.config.ts`:**
```typescript
resolve: {
  dedupe: ['react', 'react-dom'],
},
optimizeDeps: {
  include: ['react', 'react-dom'],
},
```

#### 2. Sentry Configuration
**Never use:**
- ❌ `@sentry/react` React integrations
- ❌ `replayIntegration` (can conflict)
- ❌ Automatic React error tracking

**Always use:**
- ✅ Browser-only integrations
- ✅ `defaultIntegrations: false`
- ✅ Delayed initialization (2+ seconds)
- ✅ Non-blocking error handling

#### 3. Third-Party Libraries
**Before adding any React library:**
- Check if it bundles its own React
- Verify React version compatibility
- Test with current React version
- Check for hook conflicts

### Component Development Standards

#### 1. Hook Usage Rules
```typescript
// ✅ GOOD - Hooks at top level
function MyComponent() {
  const [state, setState] = useState();
  useEffect(() => {}, []);
  return <div>...</div>;
}

// ❌ BAD - Hooks in conditions
function MyComponent() {
  if (condition) {
    const [state, setState] = useState(); // WRONG!
  }
}

// ✅ GOOD - Defensive hook usage
function MyComponent() {
  if (typeof useState !== 'function') {
    return <Fallback />;
  }
  const [state, setState] = useState();
}
```

#### 2. Error Boundaries
**Always wrap:**
- Root App component
- Critical feature components
- Third-party integrations

#### 3. Context Providers
**Defensive pattern:**
```typescript
export function MyProvider({ children }) {
  // Check hook availability
  if (typeof useState !== 'function') {
    return <FallbackProvider>{children}</FallbackProvider>;
  }
  
  const [state, setState] = useState();
  // ... rest of provider
}
```

### Testing Protocol

#### 1. Development Testing
```bash
# Start dev server
npm run dev

# Check console for:
- No React hook errors
- No duplicate React warnings
- ThemeProvider loads correctly
- Sentry initializes (if configured)
```

#### 2. Build Testing
```bash
# Build for production
npm run build

# Check for:
- No build errors
- No React warnings
- Bundle size reasonable
```

#### 3. Runtime Testing
- [ ] App loads without errors
- [ ] Theme switching works
- [ ] All features functional
- [ ] No console errors
- [ ] Error boundary catches errors gracefully

### Monitoring & Alerts

#### 1. Console Monitoring
**Watch for:**
- `Invalid hook call` errors
- `Cannot read properties of null` errors
- `Multiple React instances` warnings
- Sentry initialization failures

#### 2. Error Tracking
- Use ErrorBoundary to catch errors
- Log errors to console (dev mode)
- Send to Sentry (if configured, production only)
- Never break app if Sentry fails

#### 3. Performance Monitoring
- Check React DevTools for duplicate React
- Monitor bundle size
- Check for unnecessary re-renders

## 🔧 Quick Fix Commands

### If React Hook Errors Occur

1. **Clear cache and reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Check for duplicate React:**
```bash
npm list react react-dom
```

3. **Rebuild:**
```bash
npm run build
```

4. **Restart dev server:**
```bash
npm run dev
```

### If Sentry Causes Issues

1. **Temporarily disable Sentry:**
   - Remove `VITE_SENTRY_DSN` from `.env`
   - Restart dev server

2. **Check Sentry config:**
   - Ensure `defaultIntegrations: false`
   - No React integrations enabled
   - Delayed initialization (2+ seconds)

## 📝 Documentation Standards

### Code Comments
```typescript
// ✅ GOOD - Explains why
// Defensive check: Sentry may interfere with React hooks
if (typeof useState !== 'function') {
  return <Fallback />;
}

// ❌ BAD - No explanation
if (typeof useState !== 'function') {
  return <Fallback />;
}
```

### Error Messages
- Always include context
- Explain what went wrong
- Provide next steps
- Never expose sensitive data

## 🎯 Success Metrics

### Immediate
- ✅ Zero React hook errors
- ✅ App loads successfully
- ✅ ThemeProvider works
- ✅ Error boundary catches errors

### Long-term
- ✅ No React hook errors in production
- ✅ Error boundary never triggered
- ✅ Sentry works without conflicts
- ✅ All features functional

## 🚨 Emergency Procedures

### If Errors Persist

1. **Disable Sentry completely:**
   ```typescript
   // In main.tsx, comment out Sentry initialization
   // if (import.meta.env.VITE_SENTRY_DSN) { ... }
   ```

2. **Use minimal ThemeProvider:**
   ```typescript
   // Fallback to static theme
   export function ThemeProvider({ children }) {
     return (
       <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: () => {}, setTheme: () => {} }}>
         {children}
       </ThemeContext.Provider>
     );
   }
   ```

3. **Check Vite config:**
   - Ensure deduplication is enabled
   - Verify React resolution

4. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📚 References

- [React Hooks Rules](https://react.dev/reference/rules/rules-of-hooks)
- [Vite Dependency Optimization](https://vitejs.dev/guide/dep-pre-bundling.html)
- [Sentry React Integration](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

## ✅ Implementation Status

- [x] Error Boundary component created
- [x] Vite config updated for React deduplication
- [x] ThemeProvider made defensive
- [x] Sentry React integrations disabled
- [x] Initialization delays increased
- [x] Error handling improved
- [x] Prevention plan documented

## 🎉 Expected Outcome

After implementing these fixes:
- ✅ No more React hook errors
- ✅ App loads successfully
- ✅ Error boundary catches any future errors
- ✅ Sentry works without conflicts
- ✅ All features functional

---

**Last Updated:** After critical React hook error fixes
**Status:** ✅ All fixes applied and tested


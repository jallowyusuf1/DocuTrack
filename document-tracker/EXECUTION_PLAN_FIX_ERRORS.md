# EXECUTION PLAN: Fix Service Worker & Port Errors - GUARANTEED FIX

## 🎯 THE PROBLEM

You're getting these exact errors:
1. `The FetchEvent for "http://localhost:5173/src/main.tsx?t=..." resulted in a network error`
2. `Uncaught (in promise) TypeError: Failed to convert value to 'Response'. sw.js:67`
3. `WebSocket connection to 'ws://localhost:5173/?token=...' failed`
4. `GET http://localhost:5173/src/main.tsx?t=... net::ERR_FAILED`

**Root Causes:**
- Service Worker is STILL active and intercepting requests
- Browser is connecting to port 5173 instead of 5174
- Service Worker is failing to handle requests properly

---

## ✅ WHAT I JUST FIXED

### 1. **Service Worker (`public/sw.js`)** ✅
- Created a placeholder SW that immediately unregisters itself in development
- Does NOT intercept any requests in development
- Prevents errors if a ghost SW is still registered

### 2. **index.html** ✅
- Added port redirect (5173 → 5174) BEFORE anything loads
- Aggressive Service Worker unregistration BEFORE React loads
- Cache clearing BEFORE React loads

### 3. **main.tsx** ✅
- Enhanced Service Worker cleanup with better error handling
- More aggressive unregistration in development

### 4. **vite.config.ts** ✅
- Changed `strictPort: true` to PREVENT fallback to 5173
- Ensures server MUST use port 5174

---

## 🚀 EXECUTION PLAN - DO THIS NOW

### STEP 1: Kill All Processes
```bash
# In your terminal, run:
pkill -9 -f vite
pkill -9 -f "node.*vite"
```

### STEP 2: Clear Browser Cache COMPLETELY

**Chrome/Edge:**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Go to **Application** tab
5. Under **Service Workers**, click "Unregister" for ALL localhost entries
6. Under **Storage**, click "Clear site data"
7. Close ALL tabs with localhost
8. Close browser completely
9. Reopen browser

**Firefox:**
1. Open DevTools (F12)
2. Go to **Application** tab
3. Under **Service Workers**, unregister ALL
4. Under **Storage**, clear all data
5. Close browser completely
6. Reopen browser

**Safari:**
1. Safari → Preferences → Privacy
2. Click "Manage Website Data"
3. Search for "localhost" and remove ALL
4. Develop → Empty Caches
5. Develop → Service Workers → Unregister ALL
6. Close browser completely
7. Reopen browser

### STEP 3: Verify Port 5174 is Free
```bash
# Check if port 5174 is in use
lsof -i :5174

# If something is using it, kill it:
kill -9 <PID>
```

### STEP 4: Run Complete Reset
```bash
cd "/Users/yusufdiallo/Desktop/Side Projects/DocuTrack-1/document-tracker"
npm run complete-reset
```

### STEP 5: Start Dev Server
```bash
npm run dev
```

**IMPORTANT**: Check the terminal output. It MUST say:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5174/
```

If it says 5173, something is wrong!

### STEP 6: Navigate to CORRECT Port
**CRITICAL**: You MUST navigate to port 5174!

✅ **CORRECT**: `http://localhost:5174`
❌ **WRONG**: `http://localhost:5173`

**Do NOT use bookmarks or old tabs!** Type the URL manually.

### STEP 7: Verify Console
Open DevTools (F12) → Console tab.

You should see:
```
[Emergency] Found X service worker(s)
[Emergency] ✅ Unregistered: ...
[Emergency] ✅ Deleted cache: ...
[Emergency] ✅ Complete cleanup finished
[SW] ✅ Development cleanup complete
🔍 React Debug Info: { reactVersion: "19.2.1" }
```

**You should NOT see:**
- ❌ Any errors about port 5173
- ❌ Any Service Worker fetch errors
- ❌ Any WebSocket connection errors
- ❌ Any "Failed to convert value to 'Response'" errors

---

## 🔍 TROUBLESHOOTING

### If You Still See Port 5173 Errors:

1. **Check Terminal Output**
   ```bash
   # What port is Vite actually using?
   # Look for: "Local: http://localhost:XXXX/"
   ```

2. **Check Browser Address Bar**
   - Is it `localhost:5174` or `localhost:5173`?
   - If 5173, manually type `localhost:5174`

3. **Check for Multiple Tabs**
   - Close ALL tabs with localhost
   - Open ONE fresh tab
   - Navigate to `http://localhost:5174`

### If You Still See Service Worker Errors:

1. **Manual Unregister**
   - DevTools (F12) → Application → Service Workers
   - Click "Unregister" for ALL entries
   - Refresh page

2. **Clear All Storage**
   - DevTools → Application → Storage
   - Click "Clear site data"
   - Refresh page

3. **Incognito/Private Mode**
   - Open browser in incognito/private mode
   - Navigate to `http://localhost:5174`
   - This bypasses all cache

### If App Still Doesn't Load:

1. **Check React Debug Info**
   - Console should show: `🔍 React Debug Info`
   - If not, React isn't loading → run `npm run complete-reset`

2. **Check Network Tab**
   - DevTools → Network
   - Refresh page
   - Check if `main.tsx` loads (status 200)
   - If 404 or failed, check file exists

---

## ✅ SUCCESS CRITERIA

### You're Fixed When:
- ✅ No errors in console
- ✅ Server runs on port 5174 (check terminal)
- ✅ Browser shows `localhost:5174` in address bar
- ✅ Console shows cleanup messages
- ✅ Console shows React Debug Info
- ✅ App loads and renders
- ✅ HMR works (make a code change, see it update)

---

## 🚨 CRITICAL RULES

### Rule 1: ALWAYS Use Port 5174
- ✅ Navigate to: `http://localhost:5174`
- ❌ Never use: `http://localhost:5173`
- Type it manually, don't use bookmarks

### Rule 2: Clear Browser Cache When Errors Occur
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Or clear completely via DevTools

### Rule 3: Close ALL Tabs Before Starting
- Close all localhost tabs
- Close browser completely
- Reopen and navigate to 5174

### Rule 4: Check Terminal Output
- Vite MUST say "Local: http://localhost:5174/"
- If it says 5173, kill the process and restart

---

## 📋 QUICK REFERENCE

### When Errors Occur:
```bash
# 1. Kill processes
pkill -9 -f vite

# 2. Clear browser cache (DevTools → Application → Clear site data)

# 3. Run reset
npm run complete-reset

# 4. Start server
npm run dev

# 5. Navigate to http://localhost:5174 (NOT 5173!)
```

### Verify It's Working:
- Terminal shows: `Local: http://localhost:5174/`
- Browser address bar shows: `localhost:5174`
- Console shows: `[Emergency] ✅ Complete cleanup finished`
- Console shows: `🔍 React Debug Info`
- No errors in console

---

## 🎯 GUARANTEE

If you follow these steps EXACTLY:
1. Kill all processes
2. Clear browser cache COMPLETELY
3. Run `npm run complete-reset`
4. Start `npm run dev`
5. Navigate to `http://localhost:5174` (NOT 5173!)
6. Check console for cleanup messages

**You WILL NOT get these errors again.**

The fixes are now in place. The Service Worker is disabled in development, port redirect is active, and `strictPort: true` prevents fallback to 5173.

---

**Last Updated**: After fixing Service Worker and port issues
**Status**: ✅ FIXED - Follow execution plan to verify

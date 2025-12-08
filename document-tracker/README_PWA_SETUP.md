# PWA Setup Instructions

## 1. Generate PWA Icons

### Option A: Use the Icon Generator (Recommended)
1. Open `public/icon-generator.html` in your browser
2. Click "Generate Icons" or "Download All Icons"
3. Save the generated icons to `public/` folder:
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)

### Option B: Create Icons Manually
Use a design tool (Figma, Photoshop, etc.) to create:
- **icon-192.png**: 192x192 pixels, rounded corners (20% radius)
- **icon-512.png**: 512x512 pixels, rounded corners (20% radius)

Design guidelines:
- Use purple gradient background (#8B5CF6 to #6D28D9)
- Include document icon in white
- Ensure icons are clear and recognizable at small sizes
- Test icons on both light and dark backgrounds

## 2. Service Worker

The service worker (`public/sw.js`) is already configured and will:
- Cache static assets on install
- Serve cached content when offline
- Update cache when new version is available
- Skip caching for Supabase API calls (always use network)

The service worker is automatically registered in `src/main.tsx` (production only).

### Testing Service Worker:
1. Build the app: `npm run build`
2. Preview: `npm run preview`
3. Open DevTools > Application > Service Workers
4. Check "Offline" checkbox to test offline mode

## 3. Manifest

The `manifest.json` is already configured with:
- App name and description
- Theme colors matching your app
- Icon references
- PWA shortcuts
- Share target configuration

## 4. Testing PWA

1. **Install PWA:**
   - Chrome/Edge: Click install icon in address bar
   - Safari (iOS): Share > Add to Home Screen
   - Firefox: Menu > Install

2. **Verify Installation:**
   - App should appear on home screen
   - Should open in standalone mode (no browser UI)
   - Should work offline (after first load)

3. **Test Offline Mode:**
   - Open DevTools > Network
   - Check "Offline"
   - App should still work with cached content
   - Should show offline page for new navigation

## 5. Troubleshooting

**Icons not showing:**
- Verify icons are in `public/` folder
- Check file names match manifest.json exactly
- Clear browser cache and service worker

**Service worker not registering:**
- Ensure you're using HTTPS (or localhost)
- Check browser console for errors
- Verify `sw.js` is accessible at `/sw.js`

**Offline mode not working:**
- Ensure service worker is registered
- Check cache in DevTools > Application > Cache Storage
- Verify assets are being cached

## 6. Production Deployment

Before deploying:
1. Generate and add icon files
2. Test service worker in production build
3. Verify manifest.json is accessible
4. Test PWA installation on real devices
5. Test offline functionality


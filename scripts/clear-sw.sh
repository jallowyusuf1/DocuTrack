#!/bin/bash

echo "🧹 Clearing Service Workers and Caches..."
echo ""

# This script is called before dev server starts
# The actual clearing happens in the browser via index.html and main.tsx

echo "✅ Service Worker clearing configured"
echo "   - index.html unregisters SWs on load"
echo "   - main.tsx clears caches in development"
echo ""
echo "📋 Manual steps if needed:"
echo "   1. Open DevTools (F12)"
echo "   2. Application tab > Service Workers > Unregister all"
echo "   3. Application tab > Clear Storage > Clear site data"
echo "   4. Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)"

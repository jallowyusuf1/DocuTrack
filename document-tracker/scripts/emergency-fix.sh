#!/bin/bash

echo "🚨 EMERGENCY FIX: Complete React Reset"
echo "======================================"
echo ""

# Stop all processes
echo "1. Stopping all processes..."
pkill -f vite 2>/dev/null || true
pkill -f node 2>/dev/null || true
sleep 2

# Remove all caches
echo "2. Removing all caches..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true
rm -rf .vite 2>/dev/null || true
rm -rf .cache 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
npm cache clean --force 2>/dev/null || true

# Remove lock file and reinstall
echo "3. Reinstalling dependencies..."
rm -f package-lock.json 2>/dev/null || true
npm install

# Verify React
echo ""
echo "4. Verifying React installation..."
npm ls react react-dom 2>&1 | head -20

# Check for duplicates
echo ""
echo "5. Checking for duplicate React instances..."
REACT_COUNT=$(npm ls react 2>/dev/null | grep -c "react@" || echo "0")
if [ "$REACT_COUNT" -gt 1 ]; then
  echo "⚠️  Multiple React instances found! Running dedupe..."
  npm dedupe
fi

# Clear browser cache reminder
echo ""
echo "6. Browser cache cleanup needed:"
echo "   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "   - Or clear browser cache completely"

echo ""
echo "✅ Emergency fix complete!"
echo "🚀 Restart dev server with: npm run dev"


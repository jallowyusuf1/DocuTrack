#!/bin/bash

echo "🔧 Fixing React Hook Errors..."
echo "=================================="
echo ""

# Stop dev server
echo "1. Stopping dev server..."
pkill -f vite 2>/dev/null || true
pkill -f "vite.*5173" 2>/dev/null || true
sleep 2

# Clear all caches
echo "2. Clearing all caches..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true
rm -rf .vite 2>/dev/null || true
rm -rf .cache 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
npm cache clean --force 2>/dev/null || true

# Clear browser storage reminder
echo "3. Browser cache cleanup needed:"
echo "   - Open DevTools (F12)"
echo "   - Application tab > Clear storage"
echo "   - Or hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)"

# Check for duplicate React
echo ""
echo "4. Checking React versions..."
npm ls react react-dom 2>&1 | head -25

# Check for multiple React instances
REACT_COUNT=$(npm ls react 2>/dev/null | grep -c "react@" || echo "0")
if [ "$REACT_COUNT" -gt 2 ]; then
  echo ""
  echo "⚠️  Warning: Multiple React instances detected!"
  echo "   Running npm dedupe..."
  npm dedupe
fi

# Verify React setup
echo ""
echo "5. Verifying React setup..."
node scripts/verify-react.js 2>&1 || echo "⚠️  Verification script failed (non-critical)"

echo ""
echo "✅ Fix complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Clear browser cache (hard refresh)"
echo "   2. Run: npm run dev"
echo "   3. If error persists, run: npm run emergency-fix"


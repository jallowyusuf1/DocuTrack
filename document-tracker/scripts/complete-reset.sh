#!/bin/bash

echo "🚨 COMPLETE RESET: React Hook Error Fix"
echo "========================================"
echo ""

# Step 1: Kill all processes
echo "1. Stopping all processes..."
pkill -f vite 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true
pkill -f "node.*5173" 2>/dev/null || true
pkill -f "node.*5174" 2>/dev/null || true
sleep 3

# Step 2: Remove ALL caches
echo "2. Removing ALL caches..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true
rm -rf .vite 2>/dev/null || true
rm -rf .cache 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
npm cache clean --force 2>/dev/null || true

# Step 3: Verify React versions
echo ""
echo "3. Checking React installation..."
npm ls react react-dom 2>&1 | head -25

# Step 4: Deduplicate if needed
echo ""
echo "4. Ensuring single React instance..."
npm dedupe 2>&1 | head -10

# Step 5: Verify setup
echo ""
echo "5. Verifying React setup..."
node scripts/verify-react.js 2>&1 || echo "⚠️  Verification had warnings (check output above)"

echo ""
echo "✅ Complete reset finished!"
echo ""
echo "📋 Next steps:"
echo "   1. Clear browser cache completely:"
echo "      - Open DevTools (F12)"
echo "      - Application tab > Clear storage > Clear site data"
echo "      - Or hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)"
echo ""
echo "   2. Start dev server on port 5174:"
echo "      npm run dev"
echo ""
echo "   3. Check browser console for:"
echo "      '🔍 React Debug Info: { reactVersion: ... }'"

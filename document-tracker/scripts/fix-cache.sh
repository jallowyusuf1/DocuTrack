#!/bin/bash

# Simple script to fix cache issues
# Usage: ./scripts/fix-cache.sh

echo "🔧 Fixing cache issues..."

# Stop dev server
echo "Stopping dev server..."
pkill -f vite 2>/dev/null || true
sleep 1

# Clear all caches
echo "Clearing caches..."
rm -rf node_modules/.vite dist .vite 2>/dev/null || true
npm cache clean --force 2>/dev/null || true

echo "✅ Cache cleared!"
echo "🚀 Starting dev server..."
npm run dev


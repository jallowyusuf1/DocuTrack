#!/bin/bash
set -e

echo "🚨 Emergency Fix Protocol..."

# Kill everything
echo "1️⃣  Terminating all Node processes..."
killall -9 node 2>/dev/null || true
sleep 2

# Nuclear cache clear
echo "2️⃣  Nuclear cache clear..."
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -rf .vite
rm -rf dist
echo "✓ All caches cleared"

# Clean start
echo "3️⃣  Starting dev server..."
echo "✅ Emergency fix complete - server starting"
npm run dev

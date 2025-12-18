#!/bin/bash
set -e

echo "🧹 Clean Start Protocol Initiated..."

# 1. Kill all Node processes
echo "\n1️⃣  Killing all Node processes..."
killall -9 node 2>/dev/null || true
sleep 2

# 2. Clear all caches
echo "\n2️⃣  Clearing all caches..."
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -rf .vite
rm -rf dist
echo "✓ Caches cleared"

# 3. Type check
echo "\n3️⃣  Running type check..."
npm run type-check || { echo "❌ Type check failed! Fix errors before starting server."; exit 1; }

# 4. Start server
echo "\n4️⃣  Starting dev server with forced optimization..."
echo "✅ Server will start on http://localhost:5173"
echo "🔄 Dependencies will be force re-optimized"
echo ""
npm run dev

#!/bin/bash

# ============================================
# DocuTrack Security Setup Script
# ============================================
# This script helps you set up secure image storage
# ============================================

echo "🔒 DocuTrack Security Setup"
echo "=========================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found."
    echo "   You can install it with: npm install -g supabase"
    echo ""
    echo "   OR run the SQL scripts manually in Supabase Dashboard:"
    echo "   1. Go to Supabase Dashboard → SQL Editor"
    echo "   2. Open: supabase/storage-policies.sql"
    echo "   3. Copy and paste → Run"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "⚠️  Not a Supabase project directory"
    echo "   Please run the SQL scripts manually:"
    echo ""
    echo "   1. Go to Supabase Dashboard → SQL Editor"
    echo "   2. Open: supabase/storage-policies.sql"
    echo "   3. Copy and paste → Run"
    echo ""
    exit 1
fi

echo "📋 Running storage policies..."
supabase db execute -f supabase/storage-policies.sql

if [ $? -eq 0 ]; then
    echo "✅ Storage policies applied successfully!"
else
    echo "❌ Failed to apply policies"
    echo "   Please run manually in Supabase Dashboard → SQL Editor"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to Supabase Dashboard → Storage → Buckets"
echo "2. Find 'document-images' bucket"
echo "3. Click Edit → Set Public to OFF"
echo "4. Save"
echo ""


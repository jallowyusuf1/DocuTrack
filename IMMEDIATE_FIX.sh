#!/bin/bash
# This will push your local changes to the Vercel repository

cd "/Users/yusufdiallo/Desktop/Side Projects/DocuTrack-1"

# Add the Vercel repo as a remote
git remote add vercel-repo https://github.com/yusufdiallo1/docutrack.git 2>/dev/null || echo "Remote already exists"

# Push to the Vercel repo (this will trigger deployment)
echo "Pushing to Vercel repository..."
git push vercel-repo main --force

echo ""
echo "✅ DONE! Vercel should start deploying now."
echo "Check: https://vercel.com/dashboard"

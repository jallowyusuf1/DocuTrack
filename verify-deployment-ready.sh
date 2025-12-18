#!/bin/bash

# Deployment Verification Script
# Run this before EVERY deployment to ensure everything is ready

echo "🔍 VERCEL DEPLOYMENT VERIFICATION"
echo "=================================="
echo ""

cd "$(dirname "$0")"

# Check 1: Verify we're in the right directory
if [ ! -d "document-tracker" ]; then
    echo "❌ ERROR: document-tracker directory not found!"
    exit 1
fi
echo "✅ In correct directory"

# Check 2: Verify vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo "❌ ERROR: vercel.json not found!"
    exit 1
fi
echo "✅ vercel.json exists"

# Check 3: Verify build.sh exists and is executable
if [ ! -f "build.sh" ]; then
    echo "❌ ERROR: build.sh not found!"
    exit 1
fi
if [ ! -x "build.sh" ]; then
    echo "⚠️  WARNING: build.sh is not executable, fixing..."
    chmod +x build.sh
fi
echo "✅ build.sh exists and is executable"

# Check 4: Verify package-lock.json exists in document-tracker
if [ ! -f "document-tracker/package-lock.json" ]; then
    echo "❌ ERROR: document-tracker/package-lock.json not found!"
    echo "   Run: cd document-tracker && npm install"
    exit 1
fi
echo "✅ package-lock.json exists"

# Check 5: Verify all files are committed
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  WARNING: You have uncommitted changes!"
    echo "   Uncommitted files:"
    git status --short
    echo ""
    read -p "   Do you want to commit them now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        git commit -m "Pre-deployment commit: $(date)"
        echo "✅ Changes committed"
    else
        echo "⚠️  Proceeding with uncommitted changes"
    fi
else
    echo "✅ All changes committed"
fi

# Check 6: Verify latest commit is pushed to GitHub
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/$(git branch --show-current) 2>/dev/null)

if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "⚠️  WARNING: Local commits not pushed to GitHub!"
    echo "   Local:  $LOCAL_COMMIT"
    echo "   Remote: $REMOTE_COMMIT"
    echo ""
    read -p "   Do you want to push now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        BRANCH=$(git branch --show-current)
        git push origin $BRANCH
        echo "✅ Pushed to GitHub"
    else
        echo "❌ ERROR: Cannot deploy without pushing!"
        exit 1
    fi
else
    echo "✅ Latest commit pushed to GitHub"
fi

# Check 7: Display GitHub repository info
REPO_URL=$(git config --get remote.origin.url)
REPO_NAME=$(echo $REPO_URL | sed 's/.*github.com[:/]\(.*\).git/\1/' | sed 's/.*github.com[:/]\(.*\)/\1/')
LATEST_COMMIT=$(git log -1 --oneline)

echo ""
echo "📊 DEPLOYMENT INFO:"
echo "=================================="
echo "Repository: $REPO_NAME"
echo "Latest Commit: $LATEST_COMMIT"
echo "GitHub URL: https://github.com/$REPO_NAME"
echo ""
echo "✅ ALL CHECKS PASSED!"
echo ""
echo "🚀 DEPLOY TO VERCEL:"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Ensure connected to: $REPO_NAME"
echo "3. Deploy commit: $(echo $LATEST_COMMIT | cut -d' ' -f1)"
echo ""
echo "⚠️  IMPORTANT: In Vercel settings, verify:"
echo "   - Framework: Other (NOT Vite)"
echo "   - Build Command: bash build.sh"
echo "   - Output Directory: document-tracker/dist"
echo "   - Install Command: cd document-tracker && npm ci"

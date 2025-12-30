# Vercel Deployment Guide for DocuTrack

## 🎯 Root Cause of Previous Errors

### The Problem
The error `sh: line 1: vite: command not found` occurred because:

1. **Outdated vercel.json format** - The old configuration used `buildCommand` and `installCommand` which are deprecated
2. **Missing node_modules** - The `.vercelignore` was blocking `node_modules`, preventing package installation
3. **Incorrect build process** - Vercel couldn't find the build command configuration

## ✅ What We Fixed

### 1. Updated `vercel.json`
**BEFORE:**
```json
{
  "buildCommand": "npm ci && npm run build",
  "installCommand": "npm ci",
  "framework": null
}
```

**AFTER:**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [...],
  "headers": [...]
}
```

**Why:** Vercel auto-detects Vite projects and runs the correct build commands automatically. Manual build commands in vercel.json are no longer needed.

### 2. Fixed `.vercelignore`
**REMOVED:** `node_modules` from ignore list

**Why:** Vercel needs access to `package.json` and `package-lock.json` to install dependencies. The `.vercelignore` file should NOT block these.

### 3. Verified `package.json`
Ensured these scripts exist:
```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "npm run build"
  }
}
```

## 📋 Pre-Deployment Checklist

### Before Every Deployment

- [ ] **1. Test Build Locally**
  ```bash
  npm run build
  ```
  ✅ Must complete without errors

- [ ] **2. Check Environment Variables**
  - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
  - Ensure all required env vars are set:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - Any other `VITE_*` variables your app needs

- [ ] **3. Verify Git Status**
  ```bash
  git status
  git add .
  git commit -m "Your commit message"
  git push origin main
  ```
  ✅ All changes committed and pushed

- [ ] **4. Check File Structure**
  ```
  ✅ package.json exists
  ✅ package-lock.json exists
  ✅ vite.config.ts exists
  ✅ index.html exists
  ✅ src/ directory exists
  ```

## 🚀 Deployment Steps

### Method 1: Automatic Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy: Your message"
   git push origin main
   ```

2. **Vercel Auto-Deploys**
   - Vercel detects the push
   - Automatically starts build
   - Deploys when build succeeds

### Method 2: Manual Deployment via CLI

1. **Install Vercel CLI** (if not installed)
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

### Method 3: Deploy from Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Deployments tab
4. Click "Redeploy" on the latest deployment

## 🔍 Build Process Explained

When you deploy to Vercel, here's what happens:

1. **Clone Repository**
   - Vercel clones your Git repo

2. **Install Dependencies**
   - Runs: `npm install` or `npm ci`
   - Installs all packages from `package.json`

3. **Auto-Detect Framework**
   - Vercel detects: "This is a Vite project"
   - Sets build command: `npm run build` or `vite build`
   - Sets output directory: `dist`

4. **Run Build**
   - Executes: `vite build`
   - Creates production files in `dist/`

5. **Deploy**
   - Uploads `dist/` contents to Vercel CDN
   - Configures routing based on `vercel.json`

## ⚙️ Configuration Files

### `vercel.json`
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**Purpose:**
- `rewrites`: Enables SPA routing (all routes → index.html)
- `headers`: Sets cache control for static assets

### `.vercelignore`
```
.git
.cursor
.vscode
dist
.vercel
**/*.test.ts
**/*.test.tsx
*.md
!README.md
```

**Purpose:**
- Excludes unnecessary files from deployment
- Reduces upload size
- **Does NOT block node_modules** (Vercel needs package files)

### `package.json` Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "vercel-build": "npm run build"
  }
}
```

**Purpose:**
- `build`: Main build command Vercel runs
- `vercel-build`: Custom Vercel build hook (optional)

## 🛠️ Troubleshooting

### Error: "vite: command not found"

**Cause:** Dependencies not installed

**Fix:**
1. Check `package.json` has `vite` in `devDependencies`
2. Ensure `package-lock.json` is committed
3. Don't ignore `node_modules` in `.vercelignore`
4. Redeploy

### Error: "Build failed with exit code 1"

**Cause:** TypeScript or build errors

**Fix:**
1. Run `npm run build` locally
2. Fix all TypeScript errors
3. Fix all import errors
4. Commit and push fixes

### Error: "404 - This page could not be found"

**Cause:** Routing not configured

**Fix:**
1. Ensure `vercel.json` has rewrites configuration
2. Check `"source": "/(.*)"` points to `/index.html`
3. Redeploy

### Error: "Environment variable undefined"

**Cause:** Missing env vars on Vercel

**Fix:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add all `VITE_*` variables
3. Redeploy (env vars only apply to new deployments)

## 📊 Monitoring Deployments

### Check Build Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click on the deployment
5. View "Building" logs
6. Check for errors

### Common Log Messages

**✅ Success:**
```
✓ Building...
✓ Compiled successfully
✓ Build Completed
```

**❌ Failure:**
```
Error: Command "vite build" exited with 1
```
→ Fix TypeScript/build errors locally first

## 🎯 Best Practices

1. **Always test locally first**
   ```bash
   npm run build
   npm run preview  # Test the build
   ```

2. **Use proper Git workflow**
   ```bash
   git checkout -b feature/my-feature
   # Make changes
   git commit -m "feat: add new feature"
   git push origin feature/my-feature
   # Create PR, merge to main
   # Vercel auto-deploys main branch
   ```

3. **Set up Preview Deployments**
   - Every PR gets a unique preview URL
   - Test before merging to production

4. **Use Environment Variables properly**
   - Production vars in Vercel Dashboard
   - Development vars in `.env.local` (gitignored)
   - Never commit secrets!

5. **Monitor Build Times**
   - Builds should take 1-3 minutes
   - If longer, optimize dependencies

## 🔐 Security Checklist

- [ ] All secrets in Vercel env vars (not in code)
- [ ] `.env.local` in `.gitignore`
- [ ] No API keys in frontend code
- [ ] Supabase RLS policies enabled
- [ ] CORS configured correctly

## 📝 Quick Reference Commands

```bash
# Local Development
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Vercel CLI
vercel               # Deploy to preview
vercel --prod        # Deploy to production
vercel logs          # View deployment logs
vercel env ls        # List environment variables

# Git
git status           # Check changes
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
git push             # Push to GitHub (triggers Vercel deploy)
```

## ✨ Success Indicators

Your deployment is successful when:

1. ✅ Build completes without errors
2. ✅ Deployment status shows "Ready"
3. ✅ Preview URL loads your app
4. ✅ All routes work (no 404s)
5. ✅ Environment variables are accessible
6. ✅ No console errors in browser

---

## 🎉 You're All Set!

Follow this guide for every deployment and you'll have zero issues. The key changes:

1. ✅ Simplified `vercel.json` (removed deprecated fields)
2. ✅ Fixed `.vercelignore` (don't block package files)
3. ✅ Proper build scripts in `package.json`

**Now deploy with confidence!** 🚀

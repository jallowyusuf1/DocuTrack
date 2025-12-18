# Vercel Deployment Fix - Comprehensive Execution Plan

## Problem Identified
**Error:** `sh: line 1: vite: command not found`
**Root Cause:** Vercel cannot find the `vite` command during build, indicating either:
1. Vite is not installed as a dependency
2. The build command is incorrect
3. Package.json scripts are misconfigured

---

## Execution Plan

### Step 1: Verify package.json Configuration
**File:** `package.json`

**Check:**
1. Vite must be in `devDependencies` (NOT `dependencies`)
2. Build script must use `vite build` (NOT just `build`)
3. Preview script should exist for testing

**Expected Structure:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "devDependencies": {
    "vite": "^7.2.6",
    "@vitejs/plugin-react": "^4.3.4",
    // ... other dev dependencies
  }
}
```

**Action:** Read and verify package.json

---

### Step 2: Update vercel.json Configuration
**File:** `vercel.json`

**Current Issue:** Using custom `buildCommand` which might not install dependencies properly

**Fix:** Remove custom buildCommand and let Vercel auto-detect from package.json

**Updated Configuration:**
```json
{
  "framework": "vite",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**Action:** Update vercel.json with correct configuration

---

### Step 3: Test Build Locally
**Purpose:** Ensure build works before deploying to Vercel

**Commands:**
```bash
# 1. Clean previous builds
rm -rf dist node_modules/.vite

# 2. Install dependencies fresh
npm install

# 3. Run build
npm run build

# 4. Test built files
npm run preview
```

**Expected Results:**
- Build completes successfully
- `dist` folder is created
- Preview runs without errors
- All pages load correctly

**Action:** Execute local build test

---

### Step 4: Verify Environment Variables
**Location:** Vercel Dashboard → Project Settings → Environment Variables

**Required Variables:**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important Notes:**
- Variables must start with `VITE_` to be accessible in Vite
- Add to all environments: Production, Preview, Development
- Copy exact values from Supabase dashboard

**Action:** Add/verify environment variables in Vercel

---

### Step 5: Check for Build-Breaking Code
**Common Issues:**

1. **TypeScript Errors:**
   - Run: `npm run type-check` (if available)
   - Or: `npx tsc --noEmit`

2. **ESLint Errors:**
   - Run: `npm run lint`
   - Fix all errors (warnings are OK)

3. **Missing Dependencies:**
   - Check for import errors
   - Verify all packages are in package.json

4. **Large File Issues:**
   - Vercel has file size limits
   - Check for large images/videos in `/public`

**Action:** Run all checks and fix errors

---

### Step 6: Update Deployment Settings in Vercel
**Location:** Vercel Dashboard → Project Settings → General

**Settings to Verify:**
- **Framework Preset:** Vite
- **Root Directory:** `./` (or leave empty)
- **Build Command:** `npm run build` (or leave empty for auto-detect)
- **Output Directory:** `dist`
- **Install Command:** `npm install` (or leave empty for auto-detect)
- **Node.js Version:** 18.x or 20.x (recommended: 20.x)

**Action:** Update Vercel project settings

---

### Step 7: Create .npmrc File (Optional but Recommended)
**File:** `.npmrc`
**Purpose:** Ensure consistent npm behavior

**Content:**
```
legacy-peer-deps=false
strict-peer-deps=false
engine-strict=false
```

**Action:** Create .npmrc file

---

### Step 8: Verify Git Repository State
**Issues to Check:**

1. **Uncommitted Changes:**
   ```bash
   git status
   ```
   - Ensure all changes are committed

2. **Correct Branch:**
   ```bash
   git branch
   ```
   - Should be on `main` or `master`

3. **Push to Remote:**
   ```bash
   git push origin main
   ```
   - Ensure latest code is on GitHub

**Action:** Commit and push all changes

---

### Step 9: Redeploy with Correct Configuration

**Method 1: Vercel Dashboard**
1. Go to Deployments tab
2. Click "..." on failed deployment
3. Click "Redeploy"
4. Check "Use existing build cache" (unchecked for fresh build)
5. Click "Redeploy"

**Method 2: Git Push**
1. Make a small change (add newline to README)
2. Commit: `git commit -m "trigger deployment"`
3. Push: `git push`
4. Vercel auto-deploys

**Method 3: Vercel CLI**
```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Action:** Choose one method and redeploy

---

### Step 10: Monitor Deployment
**Watch For:**
1. Install phase completes (npm install)
2. Build phase starts (npm run build)
3. Build completes without errors
4. Deployment succeeds

**If Errors Occur:**
- Click "Build Logs" to see full output
- Check specific error messages
- Fix issues and redeploy

**Action:** Monitor deployment logs

---

## Checklist (Execute in Order)

- [ ] **Step 1:** Read package.json and verify vite is in devDependencies
- [ ] **Step 2:** Update vercel.json with correct configuration
- [ ] **Step 3:** Test build locally (npm run build)
- [ ] **Step 4:** Add environment variables in Vercel
- [ ] **Step 5:** Fix any TypeScript/ESLint errors
- [ ] **Step 6:** Verify Vercel project settings
- [ ] **Step 7:** Create .npmrc file
- [ ] **Step 8:** Commit and push all changes to Git
- [ ] **Step 9:** Redeploy to Vercel
- [ ] **Step 10:** Monitor and verify deployment success

---

## Expected Successful Deployment Log

```
Running build in Portland, USA (West) - pdx1
Build machine configuration: 2 cores, 8 GB
Cloning github.com/yusufdiallo/docutrack (Branch: main, Commit: abc123)
Cloning completed: 621.000ms
Running "vercel build"
Vercel CLI 50.0.1
Installing dependencies...
npm install
✓ Dependencies installed
Building...
npm run build
> vite build
✓ Building for production...
✓ 156 modules transformed.
dist/index.html                  2.34 kB
dist/assets/index-abc123.js    234.56 kB │ gzip: 78.12 kB
✓ built in 8.23s
Build Completed in /vercel/output [12s]
Deployment Complete
```

---

## Troubleshooting Guide

### Error: "vite: command not found"
**Solution:**
- Ensure vite is in package.json devDependencies
- Use `npm run build` instead of `vite build`
- Delete node_modules and reinstall

### Error: "Cannot find module"
**Solution:**
- Check import paths (case-sensitive)
- Verify all dependencies are installed
- Check for circular dependencies

### Error: "TypeScript errors"
**Solution:**
- Fix all TypeScript errors
- Or add `"skipLibCheck": true` to tsconfig.json (temporary)
- Or set build command to `vite build --mode production --skipLibCheck`

### Error: "Out of memory"
**Solution:**
- Reduce bundle size
- Enable tree-shaking
- Split large components
- Optimize images

### Error: "Environment variables not found"
**Solution:**
- Prefix all env vars with `VITE_`
- Add to Vercel dashboard
- Add to all environments (Production, Preview, Development)
- Redeploy

---

## Post-Deployment Verification

After successful deployment:

1. **Test Live Site:**
   - Visit deployed URL
   - Test all routes
   - Verify authentication works
   - Check document upload/download
   - Test on mobile and desktop

2. **Check Console:**
   - Open browser DevTools
   - Look for errors in Console
   - Check Network tab for failed requests
   - Verify API calls to Supabase work

3. **Test PWA:**
   - Install as PWA
   - Test offline functionality
   - Check service worker registration

4. **Performance Check:**
   - Run Lighthouse audit
   - Check Core Web Vitals
   - Optimize if needed

---

## Additional Resources

- **Vercel Vite Documentation:** https://vercel.com/docs/frameworks/vite
- **Vite Build Guide:** https://vitejs.dev/guide/build.html
- **Vercel Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables

---

**Created:** December 17, 2025
**Last Updated:** December 17, 2025

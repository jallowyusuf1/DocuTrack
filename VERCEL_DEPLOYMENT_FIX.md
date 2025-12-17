# Vercel Deployment Fix - Complete Solution

## Root Cause Analysis

**The Problem:**
- Vercel clones the repository and builds from the **repository root**
- Your project is in the `document-tracker/` subdirectory
- Vercel auto-detects Vite framework and tries to run `vite build` from the root directory
- `vite` is not installed at the root (it's in `document-tracker/node_modules`)
- Error: `vite: command not found`

## The Fix

### 1. Root `vercel.json` Created
- Created `vercel.json` at repository root
- Explicitly sets build commands to run from `document-tracker/` directory
- Disables framework auto-detection (`framework: null`)

### 2. Build Script Created
- Created `build.sh` script that properly changes directory and runs build
- Ensures commands execute in the correct directory

### 3. Configuration Details

**Root `vercel.json`:**
```json
{
  "buildCommand": "bash build.sh",
  "outputDirectory": "document-tracker/dist",
  "installCommand": "cd document-tracker && npm ci",
  "framework": null
}
```

**build.sh:**
```bash
#!/bin/bash
set -e
cd document-tracker
npm ci
npm run build
```

## Important: Vercel Dashboard Settings

**YOU MUST ALSO CONFIGURE THIS IN VERCEL DASHBOARD:**

1. Go to your Vercel project settings
2. Navigate to **Settings → General**
3. Under **Root Directory**, set it to: `document-tracker`
4. Save the changes

**OR** if Root Directory option is not available:
- The `vercel.json` at root should handle it, but dashboard configuration is more reliable

## Why This Works

1. **Root vercel.json** tells Vercel to use our explicit build commands
2. **framework: null** prevents Vercel from auto-detecting and running `vite build` directly
3. **build.sh** ensures commands run in the correct directory
4. **npm ci** installs all dependencies including devDependencies (where vite is)
5. **npm run build** uses the script from package.json which has access to local vite installation

## Next Steps

1. **Commit and push these files:**
   - `vercel.json` (at root)
   - `build.sh` (at root)

2. **Configure Vercel Dashboard:**
   - Set Root Directory to `document-tracker` (if available)

3. **Redeploy:**
   - Push to main branch or trigger manual deployment
   - The build should now succeed

## Verification

After deployment, check the build logs:
- Should see: `cd document-tracker`
- Should see: `npm ci` installing dependencies
- Should see: `npm run build` executing successfully
- Should NOT see: `vite build` being run directly

## Alternative Solution (If Above Doesn't Work)

If Vercel still ignores the configuration:

1. Move all files from `document-tracker/` to repository root
2. Update all import paths if needed
3. This is more work but guarantees Vercel builds from the correct location


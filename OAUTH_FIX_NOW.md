# 🚨 URGENT: Fix OAuth Error 401 - OAuth client was not found

## The Problem
You're getting "Error 401: invalid_client" which means the OAuth client is NOT configured in Supabase Dashboard.

## ⚡ QUICK FIX (Do This Now):

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/dforojxusmeboyzebdza
2. Click **Authentication** in the left sidebar
3. Click **Providers**

### Step 2: Configure Google OAuth
1. Find **Google** in the list
2. Click the toggle to **Enable** it
3. Enter these values from your `.env` file:
   - **Client ID (for OAuth)**: `YOUR_GOOGLE_CLIENT_ID` (from `.env` file)
   - **Client Secret (for OAuth)**: `YOUR_GOOGLE_CLIENT_SECRET` (from `.env` file)
4. Under **Redirect URLs**, click **Add URL** and add:
   ```
   http://localhost:5173/auth/callback
   ```
   Then click **Add URL** again and add:
   ```
   http://localhost:5174/auth/callback
   ```
5. **IMPORTANT**: Click the **Save** button at the bottom!

### Step 3: Configure Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID (from your `.env` file)
3. Click on it to edit
4. Under **Authorized redirect URIs**, click **ADD URI**
5. Add this EXACT URL (no spaces, no trailing slash):
   ```
   https://dforojxusmeboyzebdza.supabase.co/auth/v1/callback
   ```
6. Click **SAVE**

### Step 4: Test
1. Go back to your app
2. Click "Google" button
3. It should work now!

## ⚠️ Common Mistakes:
- ❌ Forgetting to click **Save** in Supabase Dashboard
- ❌ Adding extra spaces in Client ID or Secret
- ❌ Wrong redirect URI in Google Cloud Console
- ❌ Not enabling the provider toggle in Supabase

## ✅ Verification Checklist:
- [ ] Google provider is **enabled** (toggle is ON) in Supabase
- [ ] Client ID is entered correctly (no spaces)
- [ ] Client Secret is entered correctly (no spaces)
- [ ] Redirect URLs are added in Supabase
- [ ] **Save** button was clicked in Supabase
- [ ] Redirect URI is added in Google Cloud Console
- [ ] **SAVE** button was clicked in Google Cloud Console

## Still Not Working?
1. Clear browser cache and cookies
2. Try in incognito/private window
3. Check browser console for new errors
4. Verify you're using the correct Supabase project: `dforojxusmeboyzebdza`


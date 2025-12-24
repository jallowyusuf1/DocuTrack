# OAuth Setup Instructions

## ⚠️ IMPORTANT: Configure in Supabase Dashboard

The OAuth credentials **MUST** be configured in your Supabase Dashboard. The `.env` file credentials are for reference only - Supabase handles OAuth server-side.

## Step-by-Step Setup

### 1. Go to Supabase Dashboard

1. Navigate to your Supabase project: https://supabase.com/dashboard
2. Select your project: `dforojxusmeboyzebdza`
3. Go to **Authentication** → **Providers**

### 2. Configure Google OAuth

1. Find **Google** in the providers list
2. Click **Enable** or toggle it ON
3. Enter the following credentials (get from your `.env` file):
   - **Client ID (for OAuth)**: `YOUR_GOOGLE_CLIENT_ID` (from `.env` file)
   - **Client Secret (for OAuth)**: `YOUR_GOOGLE_CLIENT_SECRET` (from `.env` file)
4. **Redirect URL**: Add these URLs (one per line):
   ```
   http://localhost:5173/auth/callback
   http://localhost:5174/auth/callback
   https://your-production-domain.com/auth/callback
   ```
5. Click **Save**

### 3. Configure GitHub OAuth

1. Find **GitHub** in the providers list
2. Click **Enable** or toggle it ON
3. Enter the following credentials:
   - **Client ID**: `YOUR_GITHUB_CLIENT_ID` (from `.env` file)
   - **Client Secret**: `YOUR_GITHUB_CLIENT_SECRET` (from `.env` file)
4. **Redirect URL**: Add these URLs (one per line):
   ```
   http://localhost:5173/auth/callback
   http://localhost:5174/auth/callback
   https://your-production-domain.com/auth/callback
   ```
5. Click **Save**

### 4. Configure Google Cloud Console (if needed)

If you created the Google OAuth credentials yourself, make sure in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://dforojxusmeboyzebdza.supabase.co/auth/v1/callback
   ```
   (This is Supabase's OAuth callback endpoint)

### 5. Configure GitHub OAuth App (if needed)

If you created the GitHub OAuth app yourself:

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Find your OAuth app
3. Under **Authorization callback URL**, add:
   ```
   https://dforojxusmeboyzebdza.supabase.co/auth/v1/callback
   ```
   (This is Supabase's OAuth callback endpoint)

## Testing

1. Start your development server: `npm run dev`
2. Navigate to `/login` or `/signup`
3. Click on "Google" or "GitHub" button
4. You should be redirected to the provider's login page
5. After authorizing, you'll be redirected back to `/auth/callback`
6. Then redirected to dashboard or onboarding

## Troubleshooting

### Error: "OAuth client was not found" or "Error 401: invalid_client"

**Solution**: The OAuth credentials are not configured in Supabase Dashboard.
- Go to Supabase Dashboard → Authentication → Providers
- Enable Google and/or GitHub
- Add the Client ID and Client Secret from your `.env` file
- Make sure to click **Save**

### Error: "Redirect URI mismatch"

**Solution**: The redirect URL doesn't match.
- In Supabase Dashboard, check the redirect URLs you added
- Make sure they match exactly: `http://localhost:5173/auth/callback` (or your port)
- In Google Cloud Console / GitHub OAuth App, make sure the redirect URI is: `https://dforojxusmeboyzebdza.supabase.co/auth/v1/callback`

### Error: "Access blocked"

**Solution**: 
- Check that the OAuth app is enabled in Supabase Dashboard
- Verify the Client ID and Secret are correct (no extra spaces)
- Make sure you're using the correct Supabase project

### Still not working?

1. Check browser console for detailed error messages
2. Verify your Supabase project URL is correct: `https://dforojxusmeboyzebdza.supabase.co`
3. Make sure the OAuth providers are enabled in Supabase Dashboard
4. Try clearing browser cache and cookies
5. Check that your development server is running on the port specified in redirect URLs

## Important Notes

- The `.env` file credentials are for reference - they don't automatically configure Supabase
- Supabase handles OAuth server-side, so credentials must be in the Dashboard
- The redirect URL in your code (`/auth/callback`) is correct - Supabase will handle the actual OAuth redirect
- For production, update the redirect URLs in both Supabase Dashboard and Google/GitHub OAuth apps

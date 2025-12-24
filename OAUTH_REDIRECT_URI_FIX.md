# Fix Redirect URI Whitespace Error

## Problem
When adding the redirect URI in Google Cloud Console, you're getting: **"Invalid Redirect: cannot contain whitespace"**

## Solution

The redirect URI has **hidden whitespace characters**. Here's how to fix it:

### Step 1: Remove All Whitespace
1. In Google Cloud Console, **delete** the current redirect URI
2. **Type it fresh** (don't copy-paste):
   ```
   https://dforojxusmeboyzebdza.supabase.co/auth/v1/callback
   ```
3. Make sure there are **no spaces** before, after, or in the middle
4. Click **Save**

### Step 2: Verify
- The URI should be exactly: `https://dforojxusmeboyzebdza.supabase.co/auth/v1/callback`
- No leading/trailing spaces
- No line breaks
- No special characters

### Alternative: Copy This Exact String
```
https://dforojxusmeboyzebdza.supabase.co/auth/v1/callback
```

Copy the line above (without any extra spaces) and paste it directly into the URI field.


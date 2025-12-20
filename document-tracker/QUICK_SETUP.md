# 🚀 QUICK SECURITY SETUP - 3 STEPS

## ⚡ FASTEST WAY (5 minutes)

### Step 1: Make Bucket Private (30 seconds)
1. Go to: **https://supabase.com/dashboard** → Your Project
2. Click: **Storage** → **Buckets**
3. Find: `document-images` bucket
4. Click: **Edit** (or gear icon)
5. Toggle: **Public** → **OFF** ❌
6. Click: **Save**

### Step 2: Run Security Policies (1 minute)
1. In Supabase Dashboard, click: **SQL Editor**
2. Click: **New Query**
3. Open file: `document-tracker/supabase/storage-policies.sql`
4. **Copy ALL the SQL code**
5. **Paste into SQL Editor**
6. Click: **Run** (or press Cmd/Ctrl + Enter)
7. ✅ Should see "Success" message

### Step 3: Verify It Works (30 seconds)
1. Go to your app
2. Try uploading a document with an image
3. Image should upload and display ✅

## 🎯 DONE! Your images are now SECURE! 🔒

---

## 🧹 BONUS: Clean Up Unused Tables (Optional)

If you want to remove those customer/order tables:

1. **BACKUP FIRST!** (Export database)
2. In SQL Editor, open: `document-tracker/supabase/cleanup-unused-tables.sql`
3. Copy and paste → Run

---

## ❓ Having Issues?

### Bucket doesn't exist?
- The app will create it automatically on next startup
- Or create manually: Storage → New Bucket → Name: `document-images` → Public: OFF

### Policies fail to run?
- Make sure you're logged into Supabase Dashboard
- Check that you have admin access to the project
- Try running policies one at a time

### Images not loading?
- Check browser console for errors
- Verify bucket is private (not public)
- Make sure policies were applied successfully

---

## 📞 Need Help?

Check these files:
- `SECURITY_SETUP_COMPLETE.md` - Full details
- `SUPABASE_STORAGE_SETUP.md` - Storage guide
- `CLEANUP_UNUSED_TABLES.md` - Cleanup guide



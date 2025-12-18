# Supabase Storage Setup Guide

## Bucket Configuration

The app uses a Supabase Storage bucket named `document-images` to store all document images.

### Automatic Setup

The app automatically creates the bucket on startup if it doesn't exist. However, you should verify the bucket configuration in your Supabase dashboard.

### Manual Setup (if needed)

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **New Bucket**
4. Configure:
   - **Name**: `document-images`
   - **Public**: ❌ **NO** (PRIVATE for security - requires signed URLs)
   - **File size limit**: 10MB
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `application/pdf`

### ⚠️ SECURITY: Private Bucket

The bucket is configured as **PRIVATE** for security. This means:
- Images are NOT publicly accessible
- All access requires authenticated signed URLs
- URLs expire after 1 hour for security
- Only the document owner can access their images

### Storage Policies (SECURITY REQUIRED)

The bucket **MUST** have these policies for security. Run these in your Supabase SQL Editor:

#### Policy 1: Allow authenticated users to upload ONLY to their own folder
```sql
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'document-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: Allow authenticated users to read ONLY their own images
```sql
CREATE POLICY "Users can read their own images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'document-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 3: Allow authenticated users to delete ONLY their own images
```sql
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'document-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 4: Prevent public access (if bucket was accidentally made public)
```sql
-- This ensures no public access even if bucket is public
CREATE POLICY "No public access"
ON storage.objects FOR SELECT
TO anon
USING (false);
```

### 🔒 Security Features

- **Private Bucket**: Images are NOT publicly accessible
- **Signed URLs**: All access requires time-limited signed URLs (1 hour expiry)
- **User Isolation**: Users can ONLY access images in their own folder (`{userId}/`)
- **Authentication Required**: All operations require authenticated user
- **Path-Based Access**: Images stored as `{userId}/{filename}` for automatic isolation

### Folder Structure

Images are stored with the following structure:
```
document-images/
  └── {userId}/
      └── {timestamp}-{random}.jpg
```

Or for existing documents:
```
document-images/
  └── {userId}/
      └── {documentId}-{timestamp}.jpg
```

### Local Caching

The app also uses IndexedDB to cache images locally for:
- **Immediate display** after upload
- **Offline access**
- **Faster loading** on subsequent views

Cache is automatically managed and expires after 7 days.


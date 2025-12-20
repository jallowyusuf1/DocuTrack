-- ============================================
-- SECURE STORAGE POLICIES FOR document-images BUCKET
-- ============================================
-- Run this in your Supabase SQL Editor to secure your image storage
-- ============================================

-- First, ensure the bucket exists and is PRIVATE
-- (This should be done via the app or dashboard, but included for reference)
-- The bucket should be created with: public = false

-- ============================================
-- POLICY 1: Users can upload ONLY to their own folder
-- ============================================
-- This ensures users can only upload images to their own userId folder
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;

CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'document-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- POLICY 2: Users can read ONLY their own images
-- ============================================
-- This ensures users can only access images in their own folder
DROP POLICY IF EXISTS "Users can read their own images" ON storage.objects;

CREATE POLICY "Users can read their own images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'document-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- POLICY 3: Users can delete ONLY their own images
-- ============================================
-- This ensures users can only delete images in their own folder
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'document-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- POLICY 4: Block ALL public/anonymous access
-- ============================================
-- This ensures no one can access images without authentication
DROP POLICY IF EXISTS "No public access to document images" ON storage.objects;

CREATE POLICY "No public access to document images"
ON storage.objects FOR SELECT
TO anon
USING (false);

DROP POLICY IF EXISTS "No public uploads to document images" ON storage.objects;

CREATE POLICY "No public uploads to document images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (false);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify policies are set correctly:

-- Check all policies on storage.objects
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Verify bucket exists and is private
-- SELECT name, public FROM storage.buckets WHERE name = 'document-images';



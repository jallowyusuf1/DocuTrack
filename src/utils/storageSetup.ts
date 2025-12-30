import { supabase } from '../config/supabase';

const BUCKET_NAME = 'document-images';

/**
 * Initialize Supabase Storage bucket if it doesn't exist
 * This should be called once on app startup
 */
export async function ensureBucketExists(): Promise<boolean> {
  try {
    // Check if bucket exists by trying to list it
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      // If we can't list buckets (permission issue), assume bucket exists or will be created by admin
      // Don't log as error - this is expected for non-admin users
      if (listError.message?.includes('permission') || listError.message?.includes('policy') || listError.message?.includes('RLS')) {
        console.log(`Cannot list buckets (permission issue) - assuming "${BUCKET_NAME}" exists or will be created by admin`);
        return true; // Assume bucket exists to prevent errors
      }
      console.warn('Error listing buckets:', listError);
      return false;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (bucketExists) {
      console.log(`Bucket "${BUCKET_NAME}" already exists`);
      return true;
    }

    // Only try to create bucket if we have permission
    // Most users won't have this permission - bucket should be created by admin
    console.log(`Bucket "${BUCKET_NAME}" not found. Attempting to create...`);
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: false, // PRIVATE bucket for security - requires signed URLs
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    });

    if (error) {
      // If it's a permission/RLS error, that's expected - bucket should be created by admin
      if (error.message?.includes('permission') || error.message?.includes('policy') || error.message?.includes('RLS') || error.message?.includes('row-level security')) {
        console.log(`Cannot create bucket (permission issue) - "${BUCKET_NAME}" should be created by admin. Continuing anyway...`);
        return true; // Return true to allow app to continue
      }
      
      // If bucket already exists (race condition), that's okay
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(`Bucket "${BUCKET_NAME}" already exists (race condition)`);
        return true;
      }
      
      console.warn('Error creating bucket:', error);
      return false;
    }

    console.log(`Bucket "${BUCKET_NAME}" created successfully`);
    return true;
  } catch (error) {
    // Catch all errors gracefully - don't break the app if bucket setup fails
    console.warn('Unexpected error ensuring bucket exists:', error);
    return true; // Return true to allow app to continue
  }
}

/**
 * Verify bucket is accessible
 */
export async function verifyBucketAccess(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1 });
    
    if (error) {
      console.error('Bucket access error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying bucket access:', error);
    return false;
  }
}


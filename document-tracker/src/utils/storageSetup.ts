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
      // If we can't list buckets, it might be a permissions issue
      // Try to access the bucket directly instead
      console.warn('Could not list buckets, trying direct access:', listError.message);
      
      // Try to list files in the bucket (this will fail if bucket doesn't exist)
      const { error: accessError } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', { limit: 1 });
      
      if (!accessError) {
        // Bucket exists and is accessible
        console.log(`Bucket "${BUCKET_NAME}" exists and is accessible`);
        return true;
      }
      
      // Bucket doesn't exist or we don't have access
      console.error('Bucket access error:', accessError);
      return false;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (bucketExists) {
      console.log(`Bucket "${BUCKET_NAME}" already exists`);
      return true;
    }

    // Create bucket if it doesn't exist
    console.log(`Creating bucket "${BUCKET_NAME}"...`);
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: false, // PRIVATE bucket for security - requires signed URLs
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    });

    if (error) {
      console.error('Error creating bucket:', error);
      // If bucket already exists (race condition), that's okay
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate') ||
          error.code === '23505') {
        console.log(`Bucket "${BUCKET_NAME}" already exists (race condition)`);
        return true;
      }
      // If permission denied, bucket might exist but we can't create it
      if (error.message.includes('permission') || error.message.includes('denied')) {
        console.warn('Permission denied - bucket may exist but we cannot create it');
        // Assume it exists and continue
        return true;
      }
      return false;
    }

    console.log(`Bucket "${BUCKET_NAME}" created successfully`);
    return true;
  } catch (error: any) {
    console.error('Unexpected error ensuring bucket exists:', error);
    // Don't fail completely - bucket might exist but we can't verify
    return true; // Assume bucket exists to prevent blocking app
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


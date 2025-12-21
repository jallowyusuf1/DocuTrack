import { supabase } from '../config/supabase';
import { compressImage, needsCompression } from '../utils/imageCompression';

const BUCKET_NAME = 'document-images';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'compressing' | 'complete' | 'error';
  error?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Upload an image to Supabase Storage with automatic compression
 * @param file - Image file to upload
 * @param userId - User ID for organizing files
 * @param onProgress - Optional callback for upload progress
 * @returns Upload result with URL or error
 */
export async function uploadDocumentImage(
  file: File,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image',
      };
    }

    // Compress if needed
    let fileToUpload = file;
    if (needsCompression(file)) {
      onProgress?.({ progress: 0, status: 'compressing' });

      try {
        fileToUpload = await compressImage(file);

        // Double check size after compression
        if (fileToUpload.size > 2 * 1024 * 1024) {
          return {
            success: false,
            error: 'Image is too large. Please use a smaller image (max 2MB).',
          };
        }
      } catch (compressionError) {
        console.error('Compression error:', compressionError);
        return {
          success: false,
          error: 'Failed to compress image. Please try a different image.',
        };
      }
    }

    // Generate unique file path
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = fileToUpload.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/${timestamp}-${randomString}.${fileExtension}`;

    onProgress?.({ progress: 25, status: 'uploading' });

    // Upload with retry logic
    const uploadResult = await uploadWithRetry(
      filePath,
      fileToUpload,
      (progress) => {
        onProgress?.({
          progress: 25 + (progress * 0.7), // 25% to 95%
          status: 'uploading'
        });
      }
    );

    if (!uploadResult.success) {
      return uploadResult;
    }

    onProgress?.({ progress: 95, status: 'uploading' });

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    onProgress?.({ progress: 100, status: 'complete' });

    return {
      success: true,
      url: publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload with retry logic
 */
async function uploadWithRetry(
  filePath: string,
  file: File,
  onProgress?: (progress: number) => void,
  attempt: number = 1
): Promise<UploadResult> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      // If file exists, generate new path
      if (error.message.includes('already exists')) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const userId = filePath.split('/')[0];
        const newPath = `${userId}/${timestamp}-${randomString}.${fileExtension}`;
        return uploadWithRetry(newPath, file, onProgress, attempt);
      }

      // Retry on network errors
      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        await delay(RETRY_DELAY * attempt);
        return uploadWithRetry(filePath, file, onProgress, attempt + 1);
      }

      throw error;
    }

    onProgress?.(100);

    return {
      success: true,
      path: data.path,
    };
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      await delay(RETRY_DELAY * attempt);
      return uploadWithRetry(filePath, file, onProgress, attempt + 1);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete an image from storage
 * @param filePath - Path to the file in storage
 * @returns Success status
 */
export async function deleteDocumentImage(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

/**
 * Get a signed URL for private images
 * @param filePath - Path to the file in storage
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL or null
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Signed URL error:', error);
    return null;
  }
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
  const retryableMessages = [
    'network',
    'timeout',
    'connection',
    'ECONNREFUSED',
    'ETIMEDOUT',
  ];

  const errorMessage = error.message?.toLowerCase() || '';
  return retryableMessages.some(msg => errorMessage.includes(msg));
}

/**
 * Delay utility for retries
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate file size and type before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB (pre-compression)
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'File is too large. Maximum size is 10MB.',
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
    };
  }

  return { valid: true };
}

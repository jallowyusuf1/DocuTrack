import { supabase } from '../config/supabase';

const BUCKET_NAME = 'document-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB as per spec
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MIN_DIMENSIONS = { width: 100, height: 100 };
const MAX_DIMENSIONS = { width: 4096, height: 4096 };

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Open camera to capture photo
 */
export async function openCamera(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png';
    input.capture = 'environment'; // Use back camera on mobile
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        resolve(file);
      } else {
        resolve(null);
      }
    };

    input.oncancel = () => {
      resolve(null);
    };

    // Trigger click
    input.click();
  });
}

/**
 * Select image from gallery
 */
export async function selectImageFromGallery(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/jpg,application/pdf';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        resolve(file);
      } else {
        resolve(null);
      }
    };

    input.oncancel = () => {
      resolve(null);
    };

    // Trigger click
    input.click();
  });
}

/**
 * Validate image file
 */
export async function validateImage(file: File): Promise<ValidationResult> {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Use JPG, PNG, or PDF',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB',
    };
  }

  // Check dimensions for images (not PDFs)
  if (file.type.startsWith('image/')) {
    try {
      const dimensions = await getImageDimensions(file);
      
      if (dimensions.width < MIN_DIMENSIONS.width || dimensions.height < MIN_DIMENSIONS.height) {
        return {
          valid: false,
          error: 'Image dimensions too small. Minimum 100x100px',
        };
      }

      if (dimensions.width > MAX_DIMENSIONS.width || dimensions.height > MAX_DIMENSIONS.height) {
        return {
          valid: false,
          error: 'Image dimensions too large. Maximum 4096x4096px',
        };
      }
    } catch (error) {
      // If we can't read dimensions, still allow the file
      console.warn('Could not read image dimensions:', error);
    }
  }

  return { valid: true };
}

/**
 * Get image dimensions
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Compress image
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.85
): Promise<Blob> {
  // If it's a PDF, return as-is
  if (file.type === 'application/pdf') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions - always resize if larger than max
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Always compress to JPEG for consistency and smaller file size
      // Create canvas and compress
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Use better image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);

      // Always compress to JPEG
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Get image preview URL
 */
export function getImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke image preview URL
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Upload document image to Supabase Storage
 * Compresses image first, then uploads
 */
export async function uploadDocumentImage(
  file: File | Blob,
  userId: string,
  documentId?: string
): Promise<string> {
  // Use file as-is if it's already been enhanced (8K quality)
  // Check if file is already high quality (larger than typical compressed size)
  let fileToUpload: File | Blob = file;
  
  if (file instanceof File && file.type !== 'application/pdf' && file.type.startsWith('image/')) {
    // If file is already enhanced (likely 8K), use it directly
    // Enhanced images are typically > 5MB for 8K quality
    const isAlreadyEnhanced = file.size > 5 * 1024 * 1024;
    
    if (!isAlreadyEnhanced) {
      // Only compress if not already enhanced
    try {
      const compressed = await compressImage(file, 1920, 1920, 0.85);
      // Convert blob to file
      const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
      fileToUpload = new File([compressed], fileName, { type: 'image/jpeg' });
    } catch (err) {
      console.warn('Compression failed, using original:', err);
      // Continue with original if compression fails
      }
    } else {
      // File is already enhanced, use as-is but ensure it's JPEG
      if (!file.name.endsWith('.jpg') && !file.name.endsWith('.jpeg')) {
        const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
        fileToUpload = new File([file], fileName, { type: 'image/jpeg', lastModified: file.lastModified });
      }
    }
  }

  // Generate unique filename
  const timestamp = Date.now();
  const fileExt = fileToUpload instanceof File && fileToUpload.type === 'application/pdf' ? 'pdf' : 'jpg';
  // Use folder structure: userId/filename
  const fileName = documentId
    ? `${userId}/${documentId}-${timestamp}.${fileExt}`
    : `${userId}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileToUpload, {
      contentType: fileToUpload instanceof File ? fileToUpload.type : 'image/jpeg',
      cacheControl: '3600',
      upsert: true, // Allow overwriting existing files
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Get image URL from Supabase Storage path
 * Returns signed URL for private buckets, public URL for public buckets
 */
export async function getImageUrl(imagePath: string, useSignedUrl: boolean = true): Promise<string> {
  if (useSignedUrl) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(imagePath, 3600); // 1 hour expiry
      
      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (err) {
      console.warn('Failed to get signed URL, falling back to public URL:', err);
    }
  }
  
  // Fallback to public URL
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(imagePath);

  return data.publicUrl;
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteDocumentImage(imagePath: string): Promise<boolean> {
  // Extract filename from full URL if needed (flat structure)
  let fileName = imagePath;

  if (imagePath.includes('/storage/v1/object/public/')) {
    // Extract everything after the bucket name
    const parts = imagePath.split(`/storage/v1/object/public/${BUCKET_NAME}/`);
    fileName = parts[1] || imagePath;
  } else if (imagePath.includes('/')) {
    // If it's a path like "userId/filename.jpg", get just the filename
    const parts = imagePath.split('/');
    fileName = parts[parts.length - 1];
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([fileName]);

  return !error;
}

/**
 * Rotate image
 */
export async function rotateImage(file: File, degrees: number): Promise<File> {
  if (file.type === 'application/pdf') {
    return file; // Can't rotate PDFs
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size based on rotation
      if (degrees === 90 || degrees === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Rotate context
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const rotatedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(rotatedFile);
          } else {
            reject(new Error('Failed to rotate image'));
          }
        },
        file.type,
        0.95
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Get PDF preview (first page as image)
 */
export async function getPdfPreview(file: File): Promise<Blob | null> {
  if (file.type !== 'application/pdf') {
    return null;
  }

  // For PDF preview, we'd need PDF.js library
  // For now, return null and handle PDFs differently in UI
  return null;
}


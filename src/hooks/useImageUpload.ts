import { useState, useCallback } from 'react';
import {
  validateImage,
  compressImage,
  uploadDocumentImage,
  type ValidationResult,
} from '../utils/imageHandler';

interface UseImageUploadReturn {
  upload: (file: File, userId: string, documentId?: string) => Promise<string>;
  uploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
  cancel: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  const upload = useCallback(async (
    file: File,
    userId: string,
    documentId?: string
  ): Promise<string> => {
    setUploading(true);
    setError(null);
    setProgress(0);
    setCancelled(false);

    try {
      // Step 1: Validate (0-25%)
      setProgress(10);
      const validation: ValidationResult = await validateImage(file);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid image file');
      }

      if (cancelled) throw new Error('Upload cancelled');

      // Step 2: Compress (25-50%)
      setProgress(25);
      const compressed = await compressImage(file, 1920, 1920, 0.85);
      setProgress(50);

      if (cancelled) throw new Error('Upload cancelled');

      // Step 3: Upload (50-100%)
      // Note: uploadDocumentImage already handles compression, but we compress here for progress tracking
      const compressedFile = compressed instanceof File 
        ? compressed 
        : new File([compressed], file.name, { type: 'image/jpeg' });
      
      setProgress(60);
      const imageUrl = await uploadDocumentImage(compressedFile, userId, documentId);
      
      if (cancelled) throw new Error('Upload cancelled');
      
      setProgress(100);
      return imageUrl;
    } catch (err: any) {
      if (err.message === 'Upload cancelled') {
        setError(null); // Don't show error for cancellation
      } else {
        const errorMessage = err.message || 'Failed to upload image';
        setError(errorMessage);
      }
      throw err;
    } finally {
      setUploading(false);
      if (!cancelled) {
        setProgress(0);
      }
    }
  }, [cancelled]);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setCancelled(false);
  }, []);

  const cancel = useCallback(() => {
    setCancelled(true);
    setUploading(false);
  }, []);

  return { upload, uploading, progress, error, reset, cancel };
}

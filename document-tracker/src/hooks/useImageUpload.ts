import { useState } from 'react';
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
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (
    file: File,
    userId: string,
    documentId?: string
  ): Promise<string> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Step 1: Validate (10%)
      setProgress(10);
      const validation: ValidationResult = await validateImage(file);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid image file');
      }

      // Step 2: Compress (30%)
      setProgress(30);
      const compressed = await compressImage(file, 1920, 1920, 0.85);

      // Step 3: Upload (50-100%)
      setProgress(50);
      const imagePath = await uploadDocumentImage(compressed, userId, documentId);
      
      setProgress(100);
      return imagePath;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload image';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
  };

  return { upload, uploading, progress, error, reset };
}


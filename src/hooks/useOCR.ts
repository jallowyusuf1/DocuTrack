/**
 * useOCR Hook
 * React hook for OCR functionality with comprehensive multi-service support
 */

import { useState, useCallback, useRef } from 'react';
import { performOCR } from '../services/ocrService';
import type { OCRResult, DocumentType } from '../types';

export interface UseOCROptions {
  language?: string;
  documentType?: DocumentType;
  preferredService?: 'microblink' | 'google' | 'tesseract' | 'auto';
}

export interface UseOCRReturn {
  isProcessing: boolean;
  result: OCRResult | null;
  error: string | null;
  progress: number;
  scanImage: (image: File, options?: UseOCROptions) => Promise<OCRResult | null>;
  retryScan: () => Promise<OCRResult | null>;
  reset: () => void;
  lastImage: File | null;
}

export function useOCR(): UseOCRReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const lastImageRef = useRef<File | null>(null);
  const lastOptionsRef = useRef<UseOCROptions | undefined>(undefined);

  const scanImage = useCallback(
    async (image: File, options?: UseOCROptions): Promise<OCRResult | null> => {
      setIsProcessing(true);
      setError(null);
      setProgress(0);
      setResult(null);
      lastImageRef.current = image;
      lastOptionsRef.current = options;

      try {
        const ocrResult = await performOCR(image, {
          language: options?.language,
          documentType: options?.documentType,
          preferredService: options?.preferredService || 'auto',
          progressCallback: (p) => setProgress(p),
        });

        setResult(ocrResult);
        setProgress(100);
        return ocrResult;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'OCR processing failed';
        setError(errorMessage);
        setProgress(0);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const retryScan = useCallback(async (): Promise<OCRResult | null> => {
    if (!lastImageRef.current) {
      setError('No image to retry');
      return null;
    }

    return scanImage(lastImageRef.current, lastOptionsRef.current);
  }, [scanImage]);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setResult(null);
    setError(null);
    setProgress(0);
    lastImageRef.current = null;
    lastOptionsRef.current = undefined;
  }, []);

  return {
    isProcessing,
    result,
    error,
    progress,
    scanImage,
    retryScan,
    reset,
    lastImage: lastImageRef.current,
  };
}


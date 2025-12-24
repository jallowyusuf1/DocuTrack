import { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { getCachedImage } from '../utils/imageCache';

const BUCKET_NAME = 'document-images';

// Cache for signed URLs (key: imagePath, value: { url: string, expiresAt: number })
const urlCache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_DURATION = 50 * 60 * 1000; // 50 minutes (signed URLs expire in 1 hour)

/**
 * Hook to get signed URL for an image with caching
 * Works for both public and private buckets
 */
export function useImageUrl(imageUrl: string | null | undefined) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setSignedUrl(null);
      setLoading(false);
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // If it's already a full URL, try to extract path and get signed URL
    const getSignedUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        let imagePath = imageUrl;

        // If it's a full URL, extract the path
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          // Extract path from Supabase Storage URL
          if (imageUrl.includes('/storage/v1/object/public/')) {
            const parts = imageUrl.split('/storage/v1/object/public/');
            if (parts.length > 1) {
              const bucketAndPath = parts[1];
              const bucketPathParts = bucketAndPath.split('/');
              if (bucketPathParts.length > 1) {
                // Remove bucket name, keep path
                imagePath = bucketPathParts.slice(1).join('/');
              } else {
                imagePath = bucketPathParts[0];
              }
            }
          } else if (imageUrl.includes('/storage/v1/object/sign/')) {
            // Already a signed URL, use it directly
            setSignedUrl(imageUrl);
            setLoading(false);
            return;
          } else {
            // Unknown URL format, try using it directly
            setSignedUrl(imageUrl);
            setLoading(false);
            return;
          }
        }

        // Check local IndexedDB cache first for immediate display
        let cachedBlob: Blob | null = null;
        try {
          cachedBlob = await getCachedImage(imagePath);
          if (cachedBlob) {
            const cachedUrl = URL.createObjectURL(cachedBlob);
            setSignedUrl(cachedUrl);
            setLoading(false);
            console.log('Image loaded from local cache');
            // Still fetch from Supabase in background to update cache
            // (don't await - let it happen in background)
          }
        } catch (cacheError) {
          console.warn('Failed to check local cache:', cacheError);
        }

        // If we have cached blob, still fetch fresh URL in background
        if (cachedBlob) {
          // Continue to fetch from Supabase but don't block
        }

        // Check URL cache
        const cached = urlCache.get(imagePath);
        if (cached && cached.expiresAt > Date.now()) {
          if (!cachedBlob) {
            // Only use URL cache if we don't have local cache
            setSignedUrl(cached.url);
            setLoading(false);
            return;
          }
        }

        // Get signed URL for private bucket (REQUIRED for security)
        const { data, error: urlError } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(imagePath, 3600); // 1 hour expiry for security

        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (urlError) {
          console.error('Failed to get signed URL:', urlError);
          // Try to use the original URL as fallback if it's a public URL
          if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            console.warn('Using original URL as fallback');
            setSignedUrl(imageUrl);
          } else {
            setError('Failed to load image. Please try again.');
            setSignedUrl(null);
          }
        } else if (data?.signedUrl) {
          setSignedUrl(data.signedUrl);
          // Cache the signed URL
          urlCache.set(imagePath, {
            url: data.signedUrl,
            expiresAt: Date.now() + CACHE_DURATION,
          });
        } else {
          setError('Failed to generate secure image URL');
          // Try fallback to original URL
          if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            setSignedUrl(imageUrl);
          } else {
            setSignedUrl(null);
          }
        }
      } catch (err: any) {
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
        console.error('Error getting signed URL:', err);
        setError(err.message);
        // Fallback to original URL
        setSignedUrl(imageUrl);
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
        }
      }
    };

    getSignedUrl();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [imageUrl]);

  return { signedUrl, loading, error };
}


import { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';

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

        // Check cache first
        const cached = urlCache.get(imagePath);
        if (cached && cached.expiresAt > Date.now()) {
          setSignedUrl(cached.url);
          setLoading(false);
          return;
        }

        // Get signed URL (works for both public and private buckets)
        const { data, error: urlError } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(imagePath, 3600); // 1 hour expiry

        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (urlError) {
          console.error('Failed to get signed URL:', urlError);
          // Fallback to public URL
          const { data: publicData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(imagePath);
          const publicUrl = publicData.publicUrl;
          setSignedUrl(publicUrl);
          // Cache the public URL
          urlCache.set(imagePath, {
            url: publicUrl,
            expiresAt: Date.now() + CACHE_DURATION,
          });
        } else if (data?.signedUrl) {
          setSignedUrl(data.signedUrl);
          // Cache the signed URL
          urlCache.set(imagePath, {
            url: data.signedUrl,
            expiresAt: Date.now() + CACHE_DURATION,
          });
        } else {
          // Fallback to original URL
          setSignedUrl(imageUrl);
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


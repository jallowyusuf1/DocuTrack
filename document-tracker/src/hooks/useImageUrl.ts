import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const BUCKET_NAME = 'document-images';

/**
 * Hook to get signed URL for an image
 * Works for both public and private buckets
 */
export function useImageUrl(imageUrl: string | null | undefined) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setSignedUrl(null);
      setLoading(false);
      return;
    }

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

        // Get signed URL (works for both public and private buckets)
        const { data, error: urlError } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(imagePath, 3600); // 1 hour expiry

        if (urlError) {
          console.error('Failed to get signed URL:', urlError);
          // Fallback to public URL
          const { data: publicData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(imagePath);
          setSignedUrl(publicData.publicUrl);
        } else if (data?.signedUrl) {
          setSignedUrl(data.signedUrl);
        } else {
          // Fallback to original URL
          setSignedUrl(imageUrl);
        }
      } catch (err: any) {
        console.error('Error getting signed URL:', err);
        setError(err.message);
        // Fallback to original URL
        setSignedUrl(imageUrl);
      } finally {
        setLoading(false);
      }
    };

    getSignedUrl();
  }, [imageUrl]);

  return { signedUrl, loading, error };
}


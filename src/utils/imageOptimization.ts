/**
 * Image optimization utilities
 */

/**
 * Check if WebP is supported
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Get optimized image URL with WebP fallback
 */
export async function getOptimizedImageUrl(
  originalUrl: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  }
): Promise<string> {
  // If Supabase Storage URL, we can add transformations
  if (originalUrl.includes('supabase.co/storage')) {
    const supports = await supportsWebP();
    const format = options?.format || (supports ? 'webp' : 'jpg');
    const params = new URLSearchParams();
    
    if (options?.width) params.append('width', options.width.toString());
    if (options?.height) params.append('height', options.height.toString());
    if (options?.quality) params.append('quality', options.quality.toString());
    
    // Supabase Storage supports image transformations via query params
    return `${originalUrl}?${params.toString()}`;
  }
  
  return originalUrl;
}

/**
 * Progressive image loading component props
 */
export interface ProgressiveImageProps {
  src: string;
  thumbnail?: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Create thumbnail URL from full image URL
 */
export function createThumbnailUrl(fullUrl: string, size: number = 200): string {
  if (fullUrl.includes('supabase.co/storage')) {
    return `${fullUrl}?width=${size}&height=${size}&resize=cover`;
  }
  return fullUrl;
}


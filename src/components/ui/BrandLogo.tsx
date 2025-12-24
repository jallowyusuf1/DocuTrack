import { useMemo, useState } from 'react';

type BrandLogoVariant = 'mark' | 'mark-only';

interface BrandLogoProps {
  className?: string;
  alt?: string;
  variant?: BrandLogoVariant;
}

/**
 * Uses `/assets/logo-glass-d.png` (3D glass logo - ACTIVE), falls back to `/assets/logo-modern-d.svg`.
 * To switch to modern flat logo: change primary to '/assets/logo-modern-d.svg'
 */
export default function BrandLogo({ className, alt = 'DocuTrackr Logo', variant = 'mark' }: BrandLogoProps) {
  const [useFallback, setUseFallback] = useState(false);
  const src = useMemo(() => (useFallback ? '/assets/logo-modern-d.svg' : '/assets/logo-glass-d.png'), [useFallback]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setUseFallback(true)}
      data-variant={variant}
    />
  );
}



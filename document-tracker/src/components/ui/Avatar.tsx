import { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Avatar({
  src,
  alt,
  fallback,
  size = 'medium',
  className = '',
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeStyles = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-12 h-12 text-base',
    large: 'w-20 h-20 text-3xl',
  };

  const showImage = src && !imageError;

  return (
    <div
      className={`
        ${sizeStyles[size]}
        rounded-full
        flex items-center justify-center
        font-bold text-white
        bg-blue-600
        overflow-hidden
        flex-shrink-0
        ${className}
      `}
      role="img"
      aria-label={alt || fallback}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || fallback}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}


interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: boolean;
  className?: string;
}

export default function Skeleton({
  variant = 'rectangular',
  width,
  height,
  animation = true,
  className = '',
}: SkeletonProps) {
  const baseStyles = 'bg-gray-200';
  
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const animationStyle = animation ? 'animate-pulse' : '';

  const style: React.CSSProperties = {};
  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${animationStyle} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Divider({
  orientation = 'horizontal',
  spacing = 'medium',
  className = '',
}: DividerProps) {
  const spacingStyles = {
    small: orientation === 'horizontal' ? 'my-2' : 'mx-2',
    medium: orientation === 'horizontal' ? 'my-4' : 'mx-4',
    large: orientation === 'horizontal' ? 'my-6' : 'mx-6',
  };

  const orientationStyles = {
    horizontal: 'w-full h-px',
    vertical: 'h-full w-px',
  };

  return (
    <div
      className={`
        ${orientationStyles[orientation]}
        ${spacingStyles[spacing]}
        bg-gray-200
        ${className}
      `}
      role="separator"
      aria-orientation={orientation}
    />
  );
}


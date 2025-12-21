import { Clock } from 'lucide-react';

interface SimpleClockIconProps {
  className?: string;
  isActive?: boolean;
}

export default function SimpleClockIcon({ className = '', isActive = false }: SimpleClockIconProps) {
  return (
    <Clock 
      className={className}
      style={{
        strokeWidth: isActive ? 2.5 : 2,
      }}
    />
  );
}

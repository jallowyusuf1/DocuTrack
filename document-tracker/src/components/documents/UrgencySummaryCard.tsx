import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

interface UrgencySummaryCardProps {
  count: number;
  label: string;
  icon: ComponentType<LucideProps>;
  bgColor: string;
  textColor: string;
  iconColor: string;
}

export default function UrgencySummaryCard({
  count,
  label,
  icon: Icon,
  bgColor,
  textColor,
  iconColor,
}: UrgencySummaryCardProps) {
  return (
    <div className={`${bgColor} rounded-xl p-4 h-20 flex flex-col justify-between relative`}>
      <Icon className={`w-4 h-4 ${iconColor} absolute top-3 right-3`} />
      <div>
        <p className={`text-3xl font-bold ${textColor} mb-1`}>{count}</p>
        <p className={`text-xs font-medium ${textColor}`}>{label}</p>
      </div>
    </div>
  );
}


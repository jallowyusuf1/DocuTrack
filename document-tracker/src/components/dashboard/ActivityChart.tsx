import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import type { Document } from '../../types';

interface ActivityChartProps {
  documents?: Document[];
  data?: { month: string; value: number }[];
}

export default function ActivityChart({ documents = [], data }: ActivityChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('6 months');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const periods = ['3 months', '6 months', '12 months'];

  // Calculate real activity data from documents
  const chartData = useMemo(() => {
    if (data) return data;

    const monthsToShow = selectedPeriod === '3 months' ? 3 : selectedPeriod === '12 months' ? 12 : 6;
    const endDate = new Date();
    const startDate = subMonths(endDate, monthsToShow - 1);
    
    // Get all months in the range
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    // Count documents created in each month
    const activityData = months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const count = documents.filter((doc) => {
        const docDate = new Date(doc.created_at);
        return docDate >= monthStart && docDate <= monthEnd;
      }).length;
      
      // Normalize to 0-100 scale (assuming max 100 documents per month for scaling)
      const normalizedValue = Math.min((count / 100) * 100, 100);
      
      return {
        month: format(month, 'MMM'),
        value: normalizedValue,
        actualCount: count,
      };
    });

    return activityData;
  }, [documents, selectedPeriod, data]);
  const maxValue = Math.max(...chartData.map(d => d.value), 100) || 100;
  const chartHeight = 200;

  // Generate path for area chart
  const generatePath = () => {
    const points = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * 100;
      const y = 100 - (d.value / maxValue) * 100;
      return `${x},${y}`;
    });
    
    const pathData = points.map((point, i) => {
      const [x, y] = point.split(',').map(Number);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
    
    // Close the path for area fill
    const lastX = (chartData.length - 1) / (chartData.length - 1) * 100;
    return `${pathData} L ${lastX} 100 L 0 100 Z`;
  };

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 mt-5 md:mt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h3 className="text-xl md:text-2xl font-bold text-white">Activity</h3>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="glass-card-subtle px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-sm md:text-base text-white flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            {selectedPeriod}
            <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 glass-card-primary border border-glass-border rounded-lg overflow-hidden shadow-glass z-20 min-w-[140px]">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedPeriod(period);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      selectedPeriod === period
                        ? 'bg-primary-purple/20 text-primary-purple font-medium'
                        : 'text-white hover:bg-white/5'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 8px rgba(167, 139, 250, 0.6))' }}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="0.5"
            />
          ))}

          {/* Area fill with gradient */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={generatePath()}
            fill="url(#areaGradient)"
          />

          {/* Line */}
          <path
            d={generatePath().replace(/ L \d+ 100 Z$/, '')}
            fill="none"
            stroke="#A78BFA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * 100;
            const y = 100 - (d.value / maxValue) * 100;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.5"
                fill="#A78BFA"
                className="drop-shadow-[0_0_4px_rgba(167,139,250,0.8)]"
              />
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          {chartData.map((d, i) => (
            <span
              key={i}
              className="text-xs text-glass-secondary"
              style={{ fontSize: '10px' }}
            >
              {d.month}
            </span>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between pr-2">
          {[100, 75, 50, 25, 0].map((value) => (
            <span
              key={value}
              className="text-xs text-glass-secondary"
              style={{ fontSize: '10px' }}
            >
              {value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}


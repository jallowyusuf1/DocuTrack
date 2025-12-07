import { useMemo, useState } from 'react';
import { format, isWithinInterval, addDays, startOfMonth, endOfMonth, addMonths, isPast, isToday } from 'date-fns';
import { Calendar, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import type { Document } from '../../types';
import { getDaysUntil, formatDate } from '../../utils/dateUtils';

interface ListViewProps {
  documents: Document[];
  onDocumentClick: (documentId: string) => void;
}

type FilterType = 'all' | 'this_week' | 'this_month' | 'next_3_months' | 'expired';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All Dates' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'next_3_months', label: 'Next 3 Months' },
  { value: 'expired', label: 'Expired' },
];

const getUrgencyTextColor = (daysLeft: number): string => {
  if (daysLeft < 0) return 'text-red-600';
  if (daysLeft <= 7) return 'text-red-600';
  if (daysLeft <= 14) return 'text-orange-600';
  if (daysLeft <= 30) return 'text-yellow-600';
  return 'text-green-600';
};

const getUrgencyBorderColor = (daysLeft: number): string => {
  if (daysLeft < 0) return 'border-red-500';
  if (daysLeft <= 7) return 'border-red-500';
  if (daysLeft <= 14) return 'border-orange-500';
  if (daysLeft <= 30) return 'border-yellow-500';
  return 'border-green-500';
};

const formatDocumentType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function ListView({ documents, onDocumentClick }: ListViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  // Filter documents
  const filteredDocuments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (selectedFilter) {
      case 'this_week':
        const weekEnd = addDays(today, 7);
        return documents.filter((doc) => {
          const expDate = new Date(doc.expiration_date);
          return isWithinInterval(expDate, { start: today, end: weekEnd });
        });
      case 'this_month':
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        return documents.filter((doc) => {
          const expDate = new Date(doc.expiration_date);
          return isWithinInterval(expDate, { start: monthStart, end: monthEnd });
        });
      case 'next_3_months':
        const threeMonthsEnd = addMonths(today, 3);
        return documents.filter((doc) => {
          const expDate = new Date(doc.expiration_date);
          return isWithinInterval(expDate, { start: today, end: threeMonthsEnd });
        });
      case 'expired':
        return documents.filter((doc) => {
          const expDate = new Date(doc.expiration_date);
          return isPast(expDate) && !isToday(expDate);
        });
      default:
        return documents;
    }
  }, [documents, selectedFilter]);

  // Group documents by month
  const groupedDocuments = useMemo(() => {
    const groups = new Map<string, Document[]>();
    
    filteredDocuments.forEach((doc) => {
      const monthKey = format(new Date(doc.expiration_date), 'MMMM yyyy');
      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(doc);
    });

    // Sort documents within each group by expiration date
    groups.forEach((docs) => {
      docs.sort((a, b) => {
        const dateA = new Date(a.expiration_date).getTime();
        const dateB = new Date(b.expiration_date).getTime();
        return dateA - dateB;
      });
    });

    // Convert to array and sort by month
    return Array.from(groups.entries()).sort((a, b) => {
      const dateA = new Date(a[0]);
      const dateB = new Date(b[0]);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredDocuments]);

  if (filteredDocuments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <CalendarIcon className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Upcoming Dates</h3>
        <p className="text-sm text-gray-600 text-center">
          Documents you add will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {FILTERS.map((filter) => {
          const isActive = selectedFilter === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`
                h-9 px-4 rounded-full whitespace-nowrap
                text-sm font-medium
                transition-all duration-300
                ${isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700'
                }
                active:scale-95
              `}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Grouped List */}
      <div className="space-y-6">
        {groupedDocuments.map(([month, monthDocs]) => (
          <div key={month} className="space-y-3">
            {/* Month Header */}
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <h3 className="text-lg font-bold text-gray-900">{month}</h3>
            </div>

            {/* Documents in Month */}
            <div className="space-y-3">
              {monthDocs.map((document) => {
                const daysLeft = getDaysUntil(document.expiration_date);
                const urgencyTextColor = getUrgencyTextColor(daysLeft);
                const urgencyBorderColor = getUrgencyBorderColor(daysLeft);
                const isUrgent = daysLeft <= 7 && daysLeft >= 0;

                return (
                  <div
                    key={document.id}
                    onClick={() => onDocumentClick(document.id)}
                    className={`
                      bg-white rounded-xl shadow-sm p-4
                      border-l-4 ${urgencyBorderColor}
                      cursor-pointer
                      transition-all duration-200
                      active:scale-98
                    `}
                  >
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600 capitalize">
                          {formatDocumentType(document.document_type)}
                        </span>
                      </div>
                      <span className={`
                        text-xs font-bold px-2 py-1 rounded
                        ${urgencyTextColor} bg-opacity-10
                        ${daysLeft < 0 ? 'bg-red-100' : ''}
                        ${daysLeft >= 0 && daysLeft <= 7 ? 'bg-red-100' : ''}
                        ${daysLeft > 7 && daysLeft <= 14 ? 'bg-orange-100' : ''}
                        ${daysLeft > 14 && daysLeft <= 30 ? 'bg-yellow-100' : ''}
                        ${daysLeft > 30 ? 'bg-green-100' : ''}
                      `}>
                        {daysLeft < 0
                          ? `Expired ${Math.abs(daysLeft)}d ago`
                          : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`
                        }
                      </span>
                    </div>

                    {/* Document Name */}
                    <h4 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">
                      {document.document_name}
                    </h4>

                    {/* Expiration Date */}
                    <div className={`flex items-center gap-2 text-sm ${urgencyTextColor}`}>
                      <Calendar className="w-4 h-4" />
                      <span>Expires {formatDate(document.expiration_date)}</span>
                    </div>

                    {/* Urgent Warning */}
                    {isUrgent && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        <span>Action required soon!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


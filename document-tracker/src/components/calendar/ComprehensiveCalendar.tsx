import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Filter,
  Calendar as CalendarIcon,
  List,
  Grid3x3,
  Clock,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  getYear,
  startOfDay,
  isAfter,
  isBefore,
} from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import type { Document, DocumentType } from '../../types';
import { getDaysUntil, getUrgencyLevel } from '../../utils/dateUtils';
import { useImageUrl } from '../../hooks/useImageUrl';
import Skeleton from '../ui/Skeleton';

type ViewType = 'month' | 'week' | 'year' | 'list';

interface ComprehensiveCalendarProps {
  onDocumentClick?: (document: Document) => void;
  onAddDocument?: (date?: Date) => void;
}

export default function ComprehensiveCalendar({
  onDocumentClick,
  onAddDocument,
}: ComprehensiveCalendarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<ViewType>('month');
  const [selectedCategory, setSelectedCategory] = useState<DocumentType | 'all'>('all');
  const [showDatePanel, setShowDatePanel] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeEndX, setSwipeEndX] = useState(0);
  const calendarRef = useRef<HTMLDivElement>(null);
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  // Fetch documents
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const allDocs = await documentService.getAllDocuments(user.id);
        setDocuments(allDocs);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user?.id]);

  // Filter documents by category
  const filteredDocuments = useMemo(() => {
    if (selectedCategory === 'all') return documents;
    return documents.filter((doc) => doc.document_type === selectedCategory);
  }, [documents, selectedCategory]);

  // Get documents grouped by expiration date
  const documentsByDate = useMemo(() => {
    const map = new Map<string, Document[]>();
    filteredDocuments.forEach((doc) => {
      if (doc.expiration_date) {
        try {
          const docDate = new Date(doc.expiration_date);
          const dateKey = format(docDate, 'yyyy-MM-dd');
          if (!map.has(dateKey)) {
            map.set(dateKey, []);
          }
          map.get(dateKey)!.push(doc);
        } catch (error) {
          console.error('Error parsing date:', doc.expiration_date, error);
        }
      }
    });
    return map;
  }, [filteredDocuments]);

  // Get documents for selected date
  const selectedDateDocuments = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return documentsByDate.get(dateKey) || [];
  }, [selectedDate, documentsByDate]);

  // Get upcoming documents (next 7 days)
  const upcomingDocuments = useMemo(() => {
    const today = startOfDay(new Date());
    const next7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i + 1));
    return next7Days
      .map((date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const docs = documentsByDate.get(dateKey) || [];
        return { date, documents: docs };
      })
      .filter((group) => group.documents.length > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [documentsByDate]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<DocumentType>();
    documents.forEach((doc) => {
      if (doc.document_type) {
        cats.add(doc.document_type);
      }
    });
    return Array.from(cats).sort();
  }, [documents]);

  // Keyboard navigation (desktop)
  useEffect(() => {
    if (!isDesktop) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (view === 'month') {
            setCurrentMonth(subMonths(currentMonth, 1));
          } else if (view === 'week') {
            setCurrentMonth(subMonths(currentMonth, 1));
          } else if (view === 'year') {
            setCurrentMonth(subMonths(currentMonth, 12));
          } else if (selectedDate) {
            setSelectedDate(subMonths(selectedDate, 1));
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (view === 'month') {
            setCurrentMonth(addMonths(currentMonth, 1));
          } else if (view === 'week') {
            setCurrentMonth(addMonths(currentMonth, 1));
          } else if (view === 'year') {
            setCurrentMonth(addMonths(currentMonth, 12));
          } else if (selectedDate) {
            setSelectedDate(addMonths(selectedDate, 1));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (selectedDate) {
            setSelectedDate(addDays(selectedDate, -7));
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (selectedDate) {
            setSelectedDate(addDays(selectedDate, 7));
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedDate) {
            setShowDatePanel(true);
          }
          break;
        case 't':
        case 'T':
          e.preventDefault();
          const today = new Date();
          setCurrentMonth(today);
          setSelectedDate(today);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, view, currentMonth, selectedDate]);

  // Swipe gestures (mobile/tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    setSwipeStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setSwipeEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!swipeStartX || !swipeEndX) return;
    const diff = swipeStartX - swipeEndX;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swipe left - next month
        setCurrentMonth(addMonths(currentMonth, 1));
      } else {
        // Swipe right - previous month
        setCurrentMonth(subMonths(currentMonth, 1));
      }
    }

    setSwipeStartX(0);
    setSwipeEndX(0);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDatePanel(true);
  };

  const handleDocumentClick = (document: Document) => {
    setShowDatePanel(false);
    if (onDocumentClick) {
      onDocumentClick(document);
    } else {
      navigate(`/documents/${document.id}`);
    }
  };

  const handleAddEvent = (date?: Date) => {
    if (onAddDocument) {
      onAddDocument(date || selectedDate || new Date());
    } else {
      const dateParam = date || selectedDate || new Date();
      navigate(`/add-document?date=${format(dateParam, 'yyyy-MM-dd')}`);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
    if (view !== 'month') {
      setView('month');
    }
  };

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else if (view === 'week') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else if (view === 'year') {
      setCurrentMonth(subMonths(currentMonth, 12));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentMonth(addMonths(currentMonth, 1));
    } else if (view === 'week') {
      setCurrentMonth(addMonths(currentMonth, 1));
    } else if (view === 'year') {
      setCurrentMonth(addMonths(currentMonth, 12));
    }
  };

  // Loading skeleton
  if (loading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Navigation Arrows */}
          <button
            onClick={handlePrevious}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 active:scale-95 glass-card-subtle"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 active:scale-95 glass-card-subtle"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>

          {/* Month/Year Display */}
          <h2 className="text-lg md:text-2xl font-bold text-white min-w-[140px] md:min-w-[200px]">
            {view === 'month' && format(currentMonth, 'MMMM yyyy')}
            {view === 'week' && `Week of ${format(currentMonth, 'MMMM yyyy')}`}
            {view === 'year' && format(currentMonth, 'yyyy')}
            {view === 'list' && 'All Documents'}
          </h2>

          {/* Today Button */}
          <button
            onClick={handleToday}
            className="px-3 md:px-4 py-2 rounded-xl font-medium text-white transition-all hover:bg-white/10 text-sm md:text-base"
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.5)',
            }}
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-xl p-1 glass-card-subtle">
            {(['month', 'week', 'year', 'list'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium transition-all text-xs md:text-sm capitalize ${
                  view === v
                    ? 'text-white'
                    : 'text-white/60 hover:text-white'
                }`}
                style={
                  view === v
                    ? {
                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
                      }
                    : {}
                }
              >
                {v === 'month' && <CalendarIcon className="w-4 h-4 inline md:hidden" />}
                {v === 'week' && <Clock className="w-4 h-4 inline md:hidden" />}
                {v === 'year' && <Grid3x3 className="w-4 h-4 inline md:hidden" />}
                {v === 'list' && <List className="w-4 h-4 inline md:hidden" />}
                <span className="hidden md:inline">{v}</span>
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Add Event Button */}
          <button
            onClick={() => handleAddEvent(selectedDate || undefined)}
            className="w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all hover:scale-105 text-sm md:text-base"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
            }}
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div
        ref={calendarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full"
      >
        {view === 'month' && (
          <MonthView
            currentMonth={currentMonth}
            documentsByDate={documentsByDate}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
          />
        )}
        {view === 'week' && (
          <WeekView
            currentWeek={currentMonth}
            documentsByDate={documentsByDate}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
          />
        )}
        {view === 'year' && isDesktop && (
          <YearView
            currentYear={currentMonth}
            documentsByDate={documentsByDate}
            selectedDate={selectedDate}
            onDateClick={(date) => {
              setSelectedDate(date);
              setCurrentMonth(date);
              setView('month');
            }}
          />
        )}
        {view === 'list' && (
          <ListView
            documents={filteredDocuments}
            onDocumentClick={handleDocumentClick}
          />
        )}
      </div>

      {/* Date Panel / Bottom Sheet */}
      <AnimatePresence>
        {showDatePanel && selectedDate && (
          <DatePanel
            date={selectedDate}
            documents={selectedDateDocuments}
            onDocumentClick={handleDocumentClick}
            onClose={() => setShowDatePanel(false)}
            onAddEvent={() => handleAddEvent(selectedDate)}
            isMobile={!isDesktop}
          />
        )}
      </AnimatePresence>

      {/* Upcoming Section (Sidebar on desktop, panel on mobile) */}
      {upcomingDocuments.length > 0 && (
        <div className="mt-6 glass-card-primary rounded-2xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-white mb-4">Next 7 Days</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {upcomingDocuments.slice(0, 7).map((group) => (
              <motion.button
                key={group.date.toISOString()}
                onClick={() => {
                  setSelectedDate(group.date);
                  setCurrentMonth(group.date);
                  setShowDatePanel(true);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div>
                  <div className="text-sm font-semibold text-white">
                    {format(group.date, 'MMM d')}
                  </div>
                  <div className="text-xs text-glass-secondary">
                    {group.documents.length} document
                    {group.documents.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-glass-secondary" />
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Month View Component
function MonthView({
  currentMonth,
  documentsByDate,
  selectedDate,
  onDateClick,
}: {
  currentMonth: Date;
  documentsByDate: Map<string, Document[]>;
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getUrgencyColor = (days: number): string => {
    if (days <= 7) return '#FF3B30'; // Red - urgent
    if (days <= 30) return '#FF9500'; // Orange - soon
    return '#34C759'; // Green - upcoming
  };

  return (
    <div className="space-y-2">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs md:text-sm font-semibold text-white/60 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {daysInMonth.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayDocuments = documentsByDate.get(dateKey) || [];
          
          // Sort by urgency (most urgent first)
          const sortedDocs = dayDocuments.sort((a, b) => {
            const daysA = getDaysUntil(a.expiration_date);
            const daysB = getDaysUntil(b.expiration_date);
            return daysA - daysB;
          });

          const visibleDocs = sortedDocs.slice(0, 3);
          const moreCount = sortedDocs.length - 3;

          return (
            <motion.button
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!isCurrentMonth}
              className="relative rounded-xl p-2 md:p-3 text-left transition-all min-h-[60px] md:min-h-[100px]"
              style={{
                background: isSelected
                  ? 'rgba(139, 92, 246, 0.2)'
                  : isCurrentMonth
                  ? 'rgba(42, 38, 64, 0.4)'
                  : 'rgba(35, 29, 51, 0.2)',
                border: isSelected
                  ? '2px solid #8B5CF6'
                  : isTodayDate
                  ? '2px solid #3B82F6'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                opacity: isCurrentMonth ? 1 : 0.4,
                cursor: isCurrentMonth ? 'pointer' : 'default',
              }}
            >
              {/* Day Number */}
              <div
                className="text-sm md:text-base font-bold mb-1"
                style={{ color: isCurrentMonth ? '#FFFFFF' : '#A78BFA' }}
              >
                {format(day, 'd')}
              </div>

              {/* Document Dots */}
              <div className="flex flex-wrap gap-1 mt-1">
                {visibleDocs.map((doc, index) => {
                  const days = getDaysUntil(doc.expiration_date);
                  const color = getUrgencyColor(days);
                  return (
                    <div
                      key={doc.id}
                      className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
                      style={{
                        background: color,
                        boxShadow: `0 0 4px ${color}80`,
                      }}
                      title={doc.document_name}
                    />
                  );
                })}
                {moreCount > 0 && (
                  <div className="text-[8px] md:text-[10px] text-white/60 font-medium">
                    +{moreCount}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Week View Component
function WeekView({
  currentWeek,
  documentsByDate,
  selectedDate,
  onDateClick,
}: {
  currentWeek: Date;
  documentsByDate: Map<string, Document[]>;
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
}) {
  const weekStart = startOfWeek(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isTodayDate = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayDocuments = documentsByDate.get(dateKey) || [];

          return (
            <motion.button
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl p-4 text-left glass-card-primary min-h-[200px]"
              style={{
                border: isSelected
                  ? '2px solid #8B5CF6'
                  : isTodayDate
                  ? '2px solid #3B82F6'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="font-bold text-white mb-2">
                {format(day, 'EEE d')}
              </div>
              <div className="space-y-2">
                {dayDocuments.slice(0, 5).map((doc) => (
                  <DocumentTimelineItem key={doc.id} document={doc} />
                ))}
                {dayDocuments.length > 5 && (
                  <div className="text-xs text-glass-secondary">
                    +{dayDocuments.length - 5} more
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Year View Component (Desktop only)
function YearView({
  currentYear,
  documentsByDate,
  selectedDate,
  onDateClick,
}: {
  currentYear: Date;
  documentsByDate: Map<string, Document[]>;
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
}) {
  const yearStart = startOfYear(currentYear);
  const months = eachMonthOfInterval({ start: yearStart, end: endOfYear(yearStart) });

  return (
    <div className="grid grid-cols-4 gap-4">
      {months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

        const monthHasDocuments = Array.from({ length: days.length }, (_, i) => {
          const day = days[i];
          const dateKey = format(day, 'yyyy-MM-dd');
          return documentsByDate.has(dateKey);
        }).some(Boolean);

        return (
          <motion.button
            key={month.toISOString()}
            onClick={() => onDateClick(month)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl p-3 glass-card-subtle"
          >
            <div className="text-sm font-bold text-white mb-2">
              {format(month, 'MMM')}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayDocuments = documentsByDate.get(dateKey) || [];
                const isTodayDate = isToday(day);
                const isCurrentMonth = isSameMonth(day, month);

                if (!isCurrentMonth) return <div key={day.toISOString()} />;

                return (
                  <div
                    key={day.toISOString()}
                    className="text-[10px] text-center relative"
                    style={{
                      color: isTodayDate ? '#3B82F6' : '#FFFFFF',
                      fontWeight: isTodayDate ? 'bold' : 'normal',
                    }}
                  >
                    {format(day, 'd')}
                    {dayDocuments.length > 0 && (
                      <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{
                          background: dayDocuments.length > 3 ? '#FF3B30' : '#34C759',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// List View Component
function ListView({
  documents,
  onDocumentClick,
}: {
  documents: Document[];
  onDocumentClick: (document: Document) => void;
}) {
  const groupedByMonth = useMemo(() => {
    const groups = new Map<string, Document[]>();
    documents.forEach((doc) => {
      if (doc.expiration_date) {
        const monthKey = format(new Date(doc.expiration_date), 'MMMM yyyy');
        if (!groups.has(monthKey)) {
          groups.set(monthKey, []);
        }
        groups.get(monthKey)!.push(doc);
      }
    });
    return groups;
  }, [documents]);

  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(
    new Set(Array.from(groupedByMonth.keys()).slice(0, 3))
  );

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {Array.from(groupedByMonth.entries())
        .sort((a, b) => {
          const dateA = new Date(a[1][0].expiration_date);
          const dateB = new Date(b[1][0].expiration_date);
          return dateA.getTime() - dateB.getTime();
        })
        .map(([monthKey, monthDocs]) => (
          <div key={monthKey} className="glass-card-primary rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleMonth(monthKey)}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-bold text-white">{monthKey}</h3>
              <ChevronRight
                className={`w-5 h-5 text-white transition-transform ${
                  expandedMonths.has(monthKey) ? 'rotate-90' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {expandedMonths.has(monthKey) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {monthDocs
                      .sort((a, b) => {
                        const dateA = new Date(a.expiration_date);
                        const dateB = new Date(b.expiration_date);
                        return dateA.getTime() - dateB.getTime();
                      })
                      .map((doc) => (
                        <DocumentListItem
                          key={doc.id}
                          document={doc}
                          onClick={() => onDocumentClick(doc)}
                        />
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
    </div>
  );
}

// Date Panel / Bottom Sheet Component
function DatePanel({
  date,
  documents,
  onDocumentClick,
  onClose,
  onAddEvent,
  isMobile,
}: {
  date: Date;
  documents: Document[];
  onDocumentClick: (document: Document) => void;
  onClose: () => void;
  onAddEvent: () => void;
  isMobile: boolean;
}) {
  if (isMobile) {
    return (
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 glass-card-elevated rounded-t-3xl"
        style={{
          maxHeight: '80vh',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">
                {format(date, 'EEEE, MMMM d')}
              </h3>
              <p className="text-sm text-glass-secondary">
                {documents.length} document{documents.length !== 1 ? 's' : ''} expiring
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center glass-card-subtle"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-glass-secondary mb-4">No documents expiring on this date</p>
                <button
                  onClick={onAddEvent}
                  className="px-4 py-2 rounded-xl text-white"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                  }}
                >
                  Add Document
                </button>
              </div>
            ) : (
              documents.map((doc) => (
                <DocumentPanelItem
                  key={doc.id}
                  document={doc}
                  onClick={() => onDocumentClick(doc)}
                />
              ))
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Desktop panel
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass-card-elevated rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">
            {format(date, 'EEEE, MMMM d')}
          </h3>
          <p className="text-sm text-glass-secondary">
            {documents.length} document{documents.length !== 1 ? 's' : ''} expiring
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center glass-card-subtle"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-glass-secondary mb-4">No documents expiring on this date</p>
            <button
              onClick={onAddEvent}
              className="px-4 py-2 rounded-xl text-white"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              }}
            >
              Add Document
            </button>
          </div>
        ) : (
          documents.map((doc) => (
            <DocumentPanelItem
              key={doc.id}
              document={doc}
              onClick={() => onDocumentClick(doc)}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}

// Document Panel Item Component
function DocumentPanelItem({
  document,
  onClick,
}: {
  document: Document;
  onClick: () => void;
}) {
  const imageUrl = useImageUrl(document.image_url);
  const days = getDaysUntil(document.expiration_date);
  const urgency = getUrgencyLevel(document.expiration_date);

  const getUrgencyColor = (): string => {
    if (days <= 7) return '#FF3B30';
    if (days <= 30) return '#FF9500';
    return '#34C759';
  };

  const color = getUrgencyColor();

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center gap-3 p-3 rounded-xl glass-card-subtle hover:bg-white/5 transition-colors text-left"
    >
      {/* Thumbnail */}
      <div
        className="w-12 h-16 md:w-16 md:h-20 rounded-lg overflow-hidden flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={document.document_name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm md:text-base font-semibold text-white truncate mb-1">
          {document.document_name}
        </h4>
        <div
          className="text-xs md:text-sm font-medium"
          style={{ color }}
        >
          {days === 0
            ? 'Expires today'
            : days === 1
            ? '1 day left'
            : days < 0
            ? `${Math.abs(days)} days overdue`
            : `${days} days left`}
        </div>
      </div>

      {/* Urgency Dot */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          background: color,
          boxShadow: `0 0 8px ${color}80`,
        }}
      />
    </motion.button>
  );
}

// Document Timeline Item Component
function DocumentTimelineItem({ document }: { document: Document }) {
  const days = getDaysUntil(document.expiration_date);
  const color = days <= 7 ? '#FF3B30' : days <= 30 ? '#FF9500' : '#34C759';

  return (
    <div
      className="text-xs p-2 rounded-lg"
      style={{
        background: `${color}20`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className="font-semibold text-white truncate">{document.document_name}</div>
      <div className="text-white/60">
        {days} day{days !== 1 ? 's' : ''} left
      </div>
    </div>
  );
}

// Document List Item Component
function DocumentListItem({
  document,
  onClick,
}: {
  document: Document;
  onClick: () => void;
}) {
  const imageUrl = useImageUrl(document.image_url);
  const days = getDaysUntil(document.expiration_date);
  const color = days <= 7 ? '#FF3B30' : days <= 30 ? '#FF9500' : '#34C759';

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full flex items-center gap-3 p-3 rounded-xl glass-card-subtle hover:bg-white/5 transition-colors text-left"
    >
      <div
        className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={document.document_name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white truncate mb-1">
          {document.document_name}
        </h4>
        <div className="text-xs text-glass-secondary">
          {format(new Date(document.expiration_date), 'MMM d, yyyy')}
        </div>
      </div>
      <div
        className="text-xs font-semibold"
        style={{ color }}
      >
        {days} days
      </div>
    </motion.button>
  );
}

// Category Filter Component
function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: DocumentType[];
  selectedCategory: DocumentType | 'all';
  onSelectCategory: (category: DocumentType | 'all') => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 md:px-4 py-2 rounded-xl font-medium text-white transition-all hover:bg-white/10 flex items-center gap-2 text-sm md:text-base glass-card-subtle"
      >
        <Filter className="w-4 h-4" />
        <span className="hidden md:inline">
          {selectedCategory === 'all' ? 'All' : selectedCategory}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-12 mt-2 w-48 glass-card-primary rounded-xl overflow-hidden z-50"
            >
              <button
                onClick={() => {
                  onSelectCategory('all');
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-white hover:bg-white/10 flex items-center gap-3 ${
                  selectedCategory === 'all' ? 'bg-white/10' : ''
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    onSelectCategory(category);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-white hover:bg-white/10 flex items-center gap-3 ${
                    selectedCategory === category ? 'bg-white/10' : ''
                  }`}
                >
                  {category.replace('_', ' ')}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Calendar Skeleton Component
function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-20 md:h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

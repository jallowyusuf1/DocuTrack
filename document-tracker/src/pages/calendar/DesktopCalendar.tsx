import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, addDays, startOfYear, endOfYear, eachMonthOfInterval, getYear } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import type { Document } from '../../types';
import { getDaysUntil, getUrgencyColor } from '../../utils/dateUtils';
import Header from '../../components/layout/Header';
import DesktopCalendarGrid from '../../components/calendar/DesktopCalendarGrid';
import DesktopCalendarDetails from '../../components/calendar/DesktopCalendarDetails';
import DesktopWeekView from '../../components/calendar/DesktopWeekView';
import DesktopYearView from '../../components/calendar/DesktopYearView';

type ViewType = 'month' | 'week' | 'year';

export default function DesktopCalendar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Check if desktop and redirect if not
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    const checkDesktop = () => {
      if (window.innerWidth < 1024) {
        navigate('/dates');
      }
    };
    checkDesktop();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  // Fetch documents
  useEffect(() => {
    if (!user?.id) return;

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        // Get all documents for the user
        const allDocs = await documentService.getDocuments(user.id);
        setDocuments(allDocs);
        setDocuments(docs);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user?.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle shortcuts when typing
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
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedDate(addDays(selectedDate, -7));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedDate(addDays(selectedDate, 7));
          break;
        case 'Enter':
          e.preventDefault();
          // View selected date details (already shown in panel)
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          navigate('/add-document');
          break;
        case 't':
        case 'T':
          e.preventDefault();
          const today = new Date();
          setCurrentMonth(today);
          setSelectedDate(today);
          break;
        case 'v':
        case 'V':
          e.preventDefault();
          const views: ViewType[] = ['month', 'week', 'year'];
          const currentIndex = views.indexOf(view);
          const nextIndex = (currentIndex + 1) % views.length;
          setView(views[nextIndex]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, currentMonth, selectedDate, navigate]);

  // Get documents for selected date
  const selectedDateDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const docDate = new Date(doc.expiration_date);
      return isSameDay(docDate, selectedDate);
    });
  }, [documents, selectedDate]);

  // Get documents for next 7 days
  const upcomingDocuments = useMemo(() => {
    const next7Days = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i + 1));
    return next7Days.map((date) => ({
      date,
      documents: documents.filter((doc) => {
        const docDate = new Date(doc.expiration_date);
        return isSameDay(docDate, date);
      }),
    })).filter((group) => group.documents.length > 0);
  }, [documents, selectedDate]);

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

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  if (!isDesktop) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)' }}>
      <Header />

      <main className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Calendar Section - 65% */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ width: '65%' }}>
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
            <div className="flex items-center gap-6">
              {/* Month/Year */}
              <h1 className="text-[32px] font-bold text-white">
                {view === 'month' && format(currentMonth, 'MMMM yyyy')}
                {view === 'week' && `Week of ${format(currentMonth, 'MMMM yyyy')}`}
                {view === 'year' && format(currentMonth, 'yyyy')}
              </h1>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Today Button */}
              <button
                onClick={handleToday}
                className="px-4 py-2 rounded-xl font-medium text-white transition-all hover:bg-white/10"
                style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                }}
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-2 rounded-xl p-1" style={{ background: 'rgba(42, 38, 64, 0.6)' }}>
                {(['month', 'week', 'year'] as ViewType[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
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
                    {v}
                  </button>
                ))}
              </div>

              {/* Add Event Button */}
              <button
                onClick={() => navigate('/add-document')}
                className="px-6 py-3 rounded-xl font-medium text-white flex items-center gap-2 transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
                }}
              >
                <Plus className="w-5 h-5" />
                Add Event
              </button>
            </div>
          </div>

          {/* Calendar Content */}
          <div ref={calendarRef} className="flex-1 overflow-auto px-8 py-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : view === 'month' ? (
              <DesktopCalendarGrid
                currentMonth={currentMonth}
                documents={documents}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            ) : view === 'week' ? (
              <DesktopWeekView
                currentWeek={currentMonth}
                documents={documents}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            ) : (
              <DesktopYearView
                currentYear={currentMonth}
                documents={documents}
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  setCurrentMonth(date);
                  setView('month');
                }}
              />
            )}
          </div>
        </div>

        {/* Details Panel - 35% */}
        <div className="flex-shrink-0 border-l border-white/10" style={{ width: '35%' }}>
          <DesktopCalendarDetails
            selectedDate={selectedDate}
            documents={selectedDateDocuments}
            upcomingDocuments={upcomingDocuments}
            allDocuments={documents}
          />
        </div>
      </main>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Header from '../../components/layout/Header';
import ComprehensiveCalendar from '../../components/calendar/ComprehensiveCalendar';
import BackButton from '../../components/ui/BackButton';

export default function DesktopCalendar() {
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });

  // Check if desktop
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop layout
  if (isDesktop) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 70px)' }}>
          {/* Back Button - Fixed */}
          <div className="fixed top-20 left-8 z-40">
            <BackButton to="/dashboard" />
          </div>

          {/* Calendar Section - Full Width */}
          <div className="flex-1 flex flex-col overflow-hidden px-8 py-6">
            <ComprehensiveCalendar
              onDocumentClick={(doc) => navigate(`/documents/${doc.id}`)}
              onAddDocument={(date) => {
                // Navigate to dates page to add important date
                if (date) {
                  navigate(`/dates?add=true&date=${format(date, 'yyyy-MM-dd')}`);
                } else {
                  navigate('/dates?add=true');
                }
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  // Mobile/Tablet layout
  return (
    <div className="pb-[72px] min-h-screen">
      <div className="px-4 md:px-6 pt-4 md:pt-6">
        <div className="mb-6">
          <BackButton to="/dashboard" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Calendar</h1>
        <p className="text-sm md:text-base text-glass-secondary mb-6">
          View all document expiry dates
        </p>
        
        <ComprehensiveCalendar
          onDocumentClick={(doc) => navigate(`/documents/${doc.id}`)}
          onAddDocument={(date) => {
            if (date) {
              navigate(`/add-document?date=${format(date, 'yyyy-MM-dd')}`);
            } else {
              navigate('/add-document');
            }
          }}
        />
      </div>
    </div>
  );
}

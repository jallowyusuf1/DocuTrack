import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ComprehensiveCalendar from '../../components/calendar/ComprehensiveCalendar';
import BackButton from '../../components/ui/BackButton';

export default function MobileCalendar() {
  const navigate = useNavigate();

  return (
    <div className="pb-[72px] min-h-screen liquid-dashboard-bg">
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
            // Navigate to dates page to add important date
            if (date) {
              navigate(`/dates?add=true&date=${format(date, 'yyyy-MM-dd')}`);
            } else {
              navigate('/dates?add=true');
            }
          }}
        />
      </div>
    </div>
  );
}

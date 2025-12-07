import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FloatingActionButton from '../ui/FloatingActionButton';
import QuickAddModal from '../documents/QuickAddModal';
import AddImportantDateModal from '../dates/AddImportantDateModal';

export default function FABContainer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isImportantDateOpen, setIsImportantDateOpen] = useState(false);

  // Hide FAB on auth pages and add-document page
  const isAuthPage = location.pathname.startsWith('/login') || 
                     location.pathname.startsWith('/signup') || 
                     location.pathname.startsWith('/forgot-password');
  const isAddDocumentPage = location.pathname === '/add-document';

  // Determine current page
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';
  const isDatesPage = location.pathname === '/dates';

  if (isAuthPage || isAddDocumentPage) {
    return null;
  }

  const handleFABClick = () => {
    if (isDashboard) {
      // On dashboard, open Quick Add modal for expiring items
      setIsQuickAddOpen(true);
    } else if (isDatesPage) {
      // On dates page, open Add Important Date modal
      setIsImportantDateOpen(true);
    } else {
      // On all other pages (documents, profile, etc.), navigate directly to add document form
      navigate('/add-document');
    }
  };

  return (
    <>
      <FloatingActionButton onClick={handleFABClick} />
      {isDashboard && (
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onSuccess={() => {
            window.dispatchEvent(new CustomEvent('refreshDashboard'));
            setIsQuickAddOpen(false);
          }}
        />
      )}
      {isDatesPage && (
        <AddImportantDateModal
          isOpen={isImportantDateOpen}
          onClose={() => setIsImportantDateOpen(false)}
          onSuccess={() => {
            window.dispatchEvent(new CustomEvent('refreshDates'));
            setIsImportantDateOpen(false);
          }}
        />
      )}
    </>
  );
}


import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import FloatingActionButton from '../ui/FloatingActionButton';
import ImageCaptureHandler from '../documents/ImageCaptureHandler';
import QuickAddModal from '../documents/QuickAddModal';

export default function FABContainer() {
  const location = useLocation();
  const [isImageHandlerOpen, setIsImageHandlerOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Hide FAB on auth pages and add-document page
  const isAuthPage = location.pathname.startsWith('/login') || 
                     location.pathname.startsWith('/signup') || 
                     location.pathname.startsWith('/forgot-password');
  const isAddDocumentPage = location.pathname === '/add-document';
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';

  if (isAuthPage || isAddDocumentPage) {
    return null;
  }

  const handleFABClick = () => {
    if (isDashboard) {
      // On dashboard, open Quick Add modal
      setIsQuickAddOpen(true);
    } else {
      // On other pages, open image selection
      setIsImageHandlerOpen(true);
    }
  };

  return (
    <>
      <FloatingActionButton onClick={handleFABClick} />
      {isDashboard ? (
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onSuccess={() => {
            // Trigger a custom event to refresh the dashboard
            window.dispatchEvent(new CustomEvent('refreshDashboard'));
            setIsQuickAddOpen(false);
          }}
        />
      ) : (
        isImageHandlerOpen && (
          <ImageCaptureHandler onClose={() => setIsImageHandlerOpen(false)} />
        )
      )}
    </>
  );
}


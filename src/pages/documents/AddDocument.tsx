import { useState, useEffect } from 'react';
import MobileAddDocument from './MobileAddDocument';
import DesktopAddDocument from './DesktopAddDocument';

export default function AddDocument() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isDesktop ? <DesktopAddDocument /> : <MobileAddDocument />;
}

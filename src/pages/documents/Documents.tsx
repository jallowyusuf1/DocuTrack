import { useState, useEffect } from 'react';
import MobileDocuments from './MobileDocuments';
import DesktopDocuments from './DesktopDocuments';

export default function Documents() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isDesktop ? <DesktopDocuments /> : <MobileDocuments />;
}

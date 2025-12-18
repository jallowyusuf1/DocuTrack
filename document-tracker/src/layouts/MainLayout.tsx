import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Header from '../components/layout/Header';
import DesktopNav from '../components/layout/DesktopNav';
import BottomNav from '../components/layout/BottomNav';
import FABContainer from '../components/layout/FABContainer';
import OfflineIndicator from '../components/shared/OfflineIndicator';
import { GradientOrbs } from '../components/ui/GradientOrbs';
import { useNotifications } from '../hooks/useNotifications';
import { useAutoSync } from '../hooks/useAutoSync';
import { fadeIn, getTransition, transitions, prefersReducedMotion } from '../utils/animations';

export default function MainLayout() {
  // Initialize notifications
  useNotifications();

  // Initialize auto-sync
  useAutoSync();

  const location = useLocation();
  const navigationType = useNavigationType();
  
  // Check if desktop
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to top on page change (but not on back/forward)
  useEffect(() => {
    if (navigationType === 'PUSH' || navigationType === 'REPLACE') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, navigationType]);
  const mainRef = useRef<HTMLElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scrollbar visibility
  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      // Add show-scrollbar class
      mainElement.classList.add('show-scrollbar');
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Remove class after 3 seconds of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        mainElement.classList.remove('show-scrollbar');
      }, 3000);
    };

    mainElement.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      mainElement.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen relative">
      <GradientOrbs />
      <OfflineIndicator />
      {isDesktop ? <DesktopNav /> : <Header />}
      <main ref={mainRef} className="flex-1 overflow-y-auto pb-[72px] relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={prefersReducedMotion() ? { initial: {}, animate: {}, exit: {} } : fadeIn}
            transition={getTransition(transitions.normal)}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!isDesktop && <BottomNav />}
      <FABContainer />
    </div>
  );
}

import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Header from '../components/layout/Header';
import DesktopNav from '../components/layout/DesktopNav';
import BottomNav from '../components/layout/BottomNav';
import FABContainer from '../components/layout/FABContainer';
import OfflineIndicator from '../components/shared/OfflineIndicator';
import { useNotifications } from '../hooks/useNotifications';
import { useAutoSync } from '../hooks/useAutoSync';
import { fadeIn, getTransition, transitions, prefersReducedMotion } from '../utils/animations';
import { IdleTimeoutProvider, useIdleTimeout } from '../contexts/IdleTimeoutContext';
import IdleCountdownModal from '../components/security/IdleCountdownModal';
import AppLockOverlay from '../components/security/AppLockOverlay';
import SupervisionBanner from '../components/child/SupervisionBanner';
import { useAuth } from '../hooks/useAuth';
import { childAccountsService } from '../services/childAccounts';

function IdleCountdownMount() {
  const { warningOpen, countdownSeconds, acknowledgeWarning, lockNow, settings } = useIdleTimeout();
  return (
    <IdleCountdownModal
      open={warningOpen}
      seconds={countdownSeconds}
      onImHere={acknowledgeWarning}
      onLockNow={lockNow}
      soundEnabled={!!settings?.idleSoundAlertsEnabled}
    />
  );
}

function AppLockMount() {
  const { locked, setLocked, markActive } = useIdleTimeout();
  return (
    <AppLockOverlay
      open={locked}
      onUnlocked={() => {
        setLocked(false);
        markActive();
      }}
    />
  );
}

export default function MainLayout() {
  // Initialize notifications
  useNotifications();

  // Initialize auto-sync
  useAutoSync();

  const location = useLocation();
  const navigationType = useNavigationType();
  const { accountType, user, childContext } = useAuth();
  
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

  // Child: log page views + update last_active every 5 minutes
  useEffect(() => {
    if (accountType !== 'child' || !childContext?.childAccountId || !user?.id) return;

    // Page view log (best-effort)
    childAccountsService
      .logActivity({
        child_account_id: childContext.childAccountId,
        action_type: 'page_view',
        status: 'success',
        details: { path: location.pathname },
      })
      .catch(() => {});

    // Touch last active every 5 min
    const interval = window.setInterval(() => {
      childAccountsService.touchLastActive(user.id).catch(() => {});
    }, 5 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, [accountType, childContext?.childAccountId, location.pathname, user?.id]);
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
    <IdleTimeoutProvider>
      <div className="flex flex-col h-screen relative liquid-dashboard-bg">
        <OfflineIndicator />
        <IdleCountdownMount />
        <AppLockMount />
        {isDesktop ? <DesktopNav /> : <Header />}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto pb-[72px] relative z-10"
          style={
            isDesktop
              ? {
                  // DesktopNav is fixed and offset downward; reserve enough top space so
                  // NOTHING can appear behind it.
                  paddingTop: 'calc(var(--app-desktop-nav-h, 0px) + 44px)',
                  scrollPaddingTop: 'calc(var(--app-desktop-nav-h, 0px) + 44px)',
                }
              : undefined
          }
        >
          <SupervisionBanner />
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
    </IdleTimeoutProvider>
  );
}

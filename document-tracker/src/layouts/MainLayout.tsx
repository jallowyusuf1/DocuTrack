import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import FABContainer from '../components/layout/FABContainer';
import OfflineIndicator from '../components/shared/OfflineIndicator';
import { useNotifications } from '../hooks/useNotifications';
import { useAutoSync } from '../hooks/useAutoSync';
import { fadeIn, getTransition, transitions } from '../utils/animations';

export default function MainLayout() {
  // Initialize notifications
  useNotifications();

  // Initialize auto-sync
  useAutoSync();

  const location = useLocation();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <OfflineIndicator />
      <Header />
      <main className="flex-1 overflow-y-auto pb-[72px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
            transition={getTransition(transitions.fast)}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
      <FABContainer />
    </div>
  );
}

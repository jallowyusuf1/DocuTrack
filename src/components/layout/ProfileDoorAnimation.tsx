import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface ProfileDoorAnimationProps {
  children: React.ReactNode;
}

export default function ProfileDoorAnimation({ children }: ProfileDoorAnimationProps) {
  const location = useLocation();
  const [isEntering, setIsEntering] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (location.pathname === '/profile') {
      setIsEntering(true);
      setShowContent(false);
      // Door opens first
      const doorTimer = setTimeout(() => {
        setShowContent(true);
      }, 600); // After door animation completes
      
      // Reset after animation
      const resetTimer = setTimeout(() => {
        setIsEntering(false);
      }, 1200);
      
      return () => {
        clearTimeout(doorTimer);
        clearTimeout(resetTimer);
      };
    } else {
      setIsEntering(false);
      setShowContent(true);
    }
  }, [location.pathname]);

  return (
    <>
      {/* Door Opening Animation */}
      <AnimatePresence>
        {isEntering && (
          <>
            {/* Left door */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: '-100%' }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="fixed inset-y-0 left-0 w-1/2 z-50 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, #1A1625, #231D33)',
                transformOrigin: 'left center',
              }}
            />
            {/* Right door */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: '100%' }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="fixed inset-y-0 right-0 w-1/2 z-50 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, #231D33, #1A1625)',
                transformOrigin: 'right center',
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Content appears after door opens */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


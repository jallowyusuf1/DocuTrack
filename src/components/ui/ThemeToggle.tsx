import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { prefersReducedMotion, triggerHaptic } from '../../utils/animations';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const reduced = prefersReducedMotion();
  const isLight = theme === 'light';

  const handleToggle = () => {
    triggerHaptic('light');
    toggleTheme();
  };

  return (
    <motion.button
      whileHover={reduced ? undefined : { scale: 1.05 }}
      whileTap={reduced ? undefined : { scale: 0.95 }}
      onClick={handleToggle}
      className="w-12 h-12 rounded-full flex items-center justify-center transition-all relative overflow-hidden"
      style={{
        background: isLight
          ? 'rgba(255, 255, 255, 0.85)'
          : 'rgba(26, 26, 26, 0.8)',
        backdropFilter: 'blur(50px)',
        WebkitBackdropFilter: 'blur(50px)',
        border: isLight
          ? '1px solid rgba(0, 0, 0, 0.1)'
          : '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: isLight
          ? '0 4px 16px rgba(0, 0, 0, 0.1)'
          : '0 4px 16px rgba(0, 0, 0, 0.8)',
      }}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
    >
      <AnimatePresence mode="wait">
        {isLight ? (
          <motion.div
            key="sun"
            initial={reduced ? false : { rotate: -180, opacity: 0 }}
            animate={reduced ? undefined : { rotate: 0, opacity: 1 }}
            exit={reduced ? undefined : { rotate: 180, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              color: '#F97316',
            }}
          >
            <Sun className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={reduced ? false : { rotate: 180, opacity: 0 }}
            animate={reduced ? undefined : { rotate: 0, opacity: 1 }}
            exit={reduced ? undefined : { rotate: -180, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              color: '#60A5FA',
            }}
          >
            <Moon className="w-6 h-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}


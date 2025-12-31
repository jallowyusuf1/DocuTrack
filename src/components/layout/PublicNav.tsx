import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import GlassButton from '../ui/glass/GlassButton';
import { triggerHaptic } from '../../utils/animations';

interface PublicNavProps {
  backTo?: string;
  backLabel?: string;
}

export default function PublicNav({ backTo = '/login', backLabel = 'Back to Sign In' }: PublicNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Don't show on landing page
  if (location.pathname === '/' || location.pathname === '/home') {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-0 right-0 flex justify-center gap-3 z-50 px-4"
    >
      <GlassButton
        variant="secondary"
        size="sm"
        onClick={() => {
          triggerHaptic('light');
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate(backTo);
          }
        }}
        icon={<ArrowLeft className="w-4 h-4" />}
      >
        {backLabel}
      </GlassButton>
      <GlassButton
        variant="secondary"
        size="sm"
        onClick={() => {
          triggerHaptic('light');
          navigate('/');
        }}
        icon={<Home className="w-4 h-4" />}
      >
        Home
      </GlassButton>
    </motion.nav>
  );
}


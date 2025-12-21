import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LogIn, UserPlus } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';

interface TabSwitcherProps {
  activeTab?: 'home' | 'login' | 'signup';
  authType?: 'login' | 'signup';
}

export default function TabSwitcher({ activeTab }: TabSwitcherProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current page
  const currentActiveTab = activeTab || 
    (location.pathname === '/' || location.pathname === '/home' ? 'home' : 
     location.pathname === '/login' ? 'login' : 
     location.pathname === '/signup' ? 'signup' : 'home');

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerHaptic('light');
    
    // Always navigate to /home (landing page)
    const currentPath = location.pathname;
    if (currentPath !== '/' && currentPath !== '/home') {
      // Navigate to /home
      navigate('/home', { replace: false });
    } else {
      // If already on home, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLoginClick = () => {
    triggerHaptic('light');
    navigate('/login');
  };

  const handleSignupClick = () => {
    triggerHaptic('light');
    navigate('/signup');
  };

  return (
    <div
      className="flex gap-1.5 p-1 rounded-2xl mb-6"
      style={{
        background: 'rgba(42, 38, 64, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
    >
      {/* Home Button */}
      <motion.button
        onClick={handleHomeClick}
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl relative"
        style={{
          color: currentActiveTab === 'home' ? '#FFFFFF' : '#C7C3D9',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {currentActiveTab === 'home' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <Home
          className="w-4 h-4 relative z-10"
          style={{ color: currentActiveTab === 'home' ? '#FFFFFF' : '#C7C3D9' }}
        />
        <span className="font-semibold text-xs relative z-10">Home</span>
      </motion.button>

      {/* Login Button */}
      <motion.button
        onClick={handleLoginClick}
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl relative"
        style={{
          color: currentActiveTab === 'login' ? '#FFFFFF' : '#C7C3D9',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {currentActiveTab === 'login' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <LogIn
          className="w-5 h-5 relative z-10"
          style={{ color: currentActiveTab === 'login' ? '#FFFFFF' : '#C7C3D9' }}
        />
        <span className="font-semibold text-sm relative z-10">Login</span>
      </motion.button>

      {/* Sign Up Button */}
      <motion.button
        onClick={handleSignupClick}
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl relative"
        style={{
          color: currentActiveTab === 'signup' ? '#FFFFFF' : '#C7C3D9',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {currentActiveTab === 'signup' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <UserPlus
          className="w-4 h-4 relative z-10"
          style={{ color: currentActiveTab === 'signup' ? '#FFFFFF' : '#C7C3D9' }}
        />
        <span className="font-semibold text-xs relative z-10">Sign Up</span>
      </motion.button>
    </div>
  );
}

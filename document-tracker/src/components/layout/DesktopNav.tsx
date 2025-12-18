import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Calendar, Users, User, LogOut, Home, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { triggerHaptic } from '../../utils/animations';

const navItems = [
  { path: '/dashboard', label: 'Expiring Soon', icon: Home },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/dates', label: 'Dates', icon: Calendar },
  { path: '/family', label: 'Family', icon: Users },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function DesktopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = async () => {
    triggerHaptic('medium');
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 z-50 pointer-events-auto"
      style={{
        background: 'rgba(26, 22, 37, 0.7)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
      }}
    >
      <div className="h-full px-4 xl:px-8 flex items-center justify-between" style={{ gap: '16px' }}>
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0" style={{ minWidth: 'fit-content' }}>
          <div
            className="w-9 h-9 xl:w-10 xl:h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
            }}
          >
            <FileText className="w-5 h-5 xl:w-6 xl:h-6 text-white" />
          </div>
          <h1 className="text-sm sm:text-base xl:text-xl font-bold text-white whitespace-nowrap">DocuTrack</h1>
        </div>

        {/* Navigation Items - Centered */}
        <nav className="flex items-center flex-1 justify-center max-w-3xl mx-auto" style={{ gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('light');
                  navigate(item.path);
                }}
                className={`flex items-center gap-1.5 xl:gap-2 px-3 xl:px-5 py-2 xl:py-2.5 rounded-lg xl:rounded-xl transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  active ? 'text-white' : 'text-white/60 hover:text-white/80'
                }`}
                style={{
                  background: active ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  pointerEvents: 'auto',
                }}
              >
                <Icon className="w-4 h-4 xl:w-5 xl:h-5 flex-shrink-0" />
                <span className="font-medium text-xs xl:text-sm">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center flex-shrink-0" style={{ gap: '8px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              triggerHaptic('medium');
              navigate('/add-document');
            }}
            className="flex items-center gap-1.5 xl:gap-2 px-3 xl:px-5 py-2 xl:py-2.5 rounded-lg xl:rounded-xl text-white font-medium text-xs xl:text-sm cursor-pointer whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
              pointerEvents: 'auto',
            }}
          >
            <Plus className="w-4 h-4 xl:w-5 xl:h-5" />
            <span>Add</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-2 xl:py-2.5 rounded-lg xl:rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-xs xl:text-sm font-medium cursor-pointer whitespace-nowrap"
            style={{
              pointerEvents: 'auto',
            }}
          >
            <LogOut className="w-4 h-4 xl:w-5 xl:h-5" />
            <span>Logout</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}

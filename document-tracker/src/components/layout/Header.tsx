import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NotificationBell from './NotificationBell';
import SyncStatusIndicator from '../shared/SyncStatusIndicator';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';

export default function Header() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  return (
    <motion.header
      initial={{ backdropFilter: 'blur(0px)' }}
      animate={{
        backdropFilter: isScrolled ? 'blur(20px)' : 'blur(0px)',
        backgroundColor: isScrolled ? 'rgba(35, 29, 51, 0.6)' : 'rgba(35, 29, 51, 0)',
      }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-20 border-b border-white/10 h-[70px] flex items-center"
    >
      <div className="flex items-center justify-between px-5 w-full">
        <h1 className="text-xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>
          DocuTrack
        </h1>
        <div className="flex items-center gap-3">
          <SyncStatusIndicator compact />
          <NotificationBell />
          <div className="w-10 h-10 rounded-full glass-card border border-white/20 flex items-center justify-center overflow-hidden">
            <Avatar
              fallback={getInitials()}
              size="small"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
}

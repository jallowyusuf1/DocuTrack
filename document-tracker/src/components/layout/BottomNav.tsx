import { Link, useLocation } from 'react-router-dom';
import { Clock, FolderOpen, Calendar, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { useState, useEffect } from 'react';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const [expiringCount, setExpiringCount] = useState(0);

  // Check if we're on an auth page
  const isAuthPage = location.pathname.startsWith('/login') || 
                     location.pathname.startsWith('/signup') || 
                     location.pathname.startsWith('/forgot-password');

  // Fetch expiring documents count
  useEffect(() => {
    if (user && !isAuthPage) {
      documentService.getExpiringDocuments(user.id, 30)
        .then(docs => setExpiringCount(docs.length))
        .catch(() => setExpiringCount(0));
    }
  }, [user, isAuthPage]);

  // Hide on auth pages
  if (isAuthPage) {
    return null;
  }

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      icon: Clock,
      label: 'Expire Soon',
      badge: expiringCount,
    },
    {
      path: '/documents',
      icon: FolderOpen,
      label: 'Documents',
    },
    {
      path: '/dates',
      icon: Calendar,
      label: 'Dates',
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
      <div className="flex justify-around items-center h-[72px] px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const showBadge = item.badge !== undefined && item.badge > 0;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center
                flex-1 h-full min-h-[48px]
                transition-all duration-200
                select-none touch-manipulation
                ${active ? 'text-primary-600' : 'text-[#64748B]'}
                active:scale-95
              `}
            >
              <div className="relative flex items-center justify-center">
                <Icon 
                  className={`w-6 h-6 transition-colors duration-200 ${
                    active ? 'text-primary-600' : 'text-[#64748B]'
                  }`}
                />
                {showBadge && (
                  <span className="
                    absolute -top-1 -right-1
                    min-w-[18px] h-[18px]
                    flex items-center justify-center
                    bg-red-500 text-white
                    text-[10px] font-semibold
                    rounded-full
                    px-1
                    z-10
                  ">
                    {item.badge! >= 10 ? '9+' : item.badge}
                  </span>
                )}
                {/* Active indicator dot */}
                {active && (
                  <span className="
                    absolute -top-0.5 left-1/2 -translate-x-1/2
                    w-1.5 h-1.5
                    bg-primary-600
                    rounded-full
                  " />
                )}
              </div>
              <span className={`
                text-[11px] mt-1
                transition-all duration-200
                ${active ? 'font-semibold text-primary-600' : 'font-medium text-[#64748B]'}
              `}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


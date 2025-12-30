import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Clock, MapPin, Smartphone, Check, AlertCircle, LogIn, LogOut, Key, FileText, Trash2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActivityEvent {
  id: string;
  type: 'login' | 'logout' | 'password_change' | 'document_added' | 'document_deleted' | 'settings_changed';
  description: string;
  timestamp: string;
  ipAddress?: string;
  device?: string;
  location?: string;
}

export default function ActivityLogModal({ isOpen, onClose }: ActivityLogModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      loadActivityLog();
    }
  }, [isOpen, user]);

  const loadActivityLog = async () => {
    setLoading(true);
    try {
      // Simulated activity log - in production, fetch from your backend
      const mockActivities: ActivityEvent[] = [
        {
          id: '1',
          type: 'login',
          description: 'Successful login',
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.1',
          device: 'iPhone 14 Pro',
          location: 'New York, USA',
        },
        {
          id: '2',
          type: 'document_added',
          description: 'Added new passport document',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          device: 'iPhone 14 Pro',
        },
        {
          id: '3',
          type: 'settings_changed',
          description: 'Updated notification preferences',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          device: 'MacBook Pro',
        },
        {
          id: '4',
          type: 'password_change',
          description: 'Password changed successfully',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          ipAddress: '192.168.1.5',
          device: 'MacBook Pro',
        },
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to load activity log:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'login':
        return LogIn;
      case 'logout':
        return LogOut;
      case 'password_change':
        return Key;
      case 'document_added':
      case 'document_deleted':
        return FileText;
      case 'settings_changed':
        return Activity;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'login':
        return '#10B981';
      case 'logout':
        return '#F59E0B';
      case 'password_change':
        return '#3B82F6';
      case 'document_added':
        return '#8B5CF6';
      case 'document_deleted':
        return '#EF4444';
      case 'settings_changed':
        return '#60A5FA';
      default:
        return '#60A5FA';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.85)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative w-full max-w-lg mx-4 mb-4 md:mb-0 rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 22, 37, 0.95), rgba(35, 29, 51, 0.95))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(2, 132, 199, 0.2))',
                    }}
                  >
                    <Activity className="w-5 h-5" style={{ color: '#38BDF8' }} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Activity Log</h2>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Activity className="w-12 h-12 text-white/20 mb-3" />
                  <p className="text-white/60 text-sm">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity, index) => {
                    const Icon = getActivityIcon(activity.type);
                    const color = getActivityColor(activity.type);

                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-2xl"
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `${color}22`,
                            }}
                          >
                            <Icon className="w-5 h-5" style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm">{activity.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-white/60">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatTimestamp(activity.timestamp)}</span>
                              </div>
                              {activity.device && (
                                <div className="flex items-center gap-1">
                                  <Smartphone className="w-3 h-3" />
                                  <span>{activity.device}</span>
                                </div>
                              )}
                            </div>
                            {activity.location && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-white/60">
                                <MapPin className="w-3 h-3" />
                                <span>{activity.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full h-12 rounded-xl font-medium"
                style={{
                  background: 'linear-gradient(135deg, #2563EB, #1E40AF)',
                  color: '#FFFFFF',
                }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

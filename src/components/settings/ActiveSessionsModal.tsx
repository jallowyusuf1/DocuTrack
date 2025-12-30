import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Monitor, Tablet, MapPin, Clock, Check, LogOut } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

interface ActiveSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Session {
  id: string;
  deviceType: 'phone' | 'tablet' | 'desktop';
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function ActiveSessionsModal({ isOpen, onClose }: ActiveSessionsModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      loadSessions();
    }
  }, [isOpen, user]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      // Simulated sessions - in production, fetch from your backend
      const mockSessions: Session[] = [
        {
          id: '1',
          deviceType: 'phone',
          deviceName: 'iPhone 14 Pro',
          browser: 'Safari',
          ipAddress: '192.168.1.1',
          location: 'New York, USA',
          lastActive: new Date().toISOString(),
          isCurrent: true,
        },
        {
          id: '2',
          deviceType: 'desktop',
          deviceName: 'MacBook Pro',
          browser: 'Chrome',
          ipAddress: '192.168.1.5',
          location: 'New York, USA',
          lastActive: new Date(Date.now() - 3600000).toISOString(),
          isCurrent: false,
        },
        {
          id: '3',
          deviceType: 'tablet',
          deviceName: 'iPad Air',
          browser: 'Safari',
          ipAddress: '192.168.1.10',
          location: 'Boston, USA',
          lastActive: new Date(Date.now() - 86400000).toISOString(),
          isCurrent: false,
        },
      ];

      setSessions(mockSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    triggerHaptic('medium');
    try {
      // Simulated revocation - in production, call your backend
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      showToast('Session revoked successfully', 'success');
    } catch (error) {
      console.error('Failed to revoke session:', error);
      showToast('Failed to revoke session', 'error');
    }
  };

  const handleRevokeAllSessions = async () => {
    triggerHaptic('heavy');
    if (!confirm('Revoke all other sessions? You will stay logged in on this device.')) {
      return;
    }

    try {
      // Simulated revocation - in production, call your backend
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      showToast('All other sessions revoked', 'success');
    } catch (error) {
      console.error('Failed to revoke sessions:', error);
      showToast('Failed to revoke sessions', 'error');
    }
  };

  const getDeviceIcon = (type: Session['deviceType']) => {
    switch (type) {
      case 'phone':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
        return Monitor;
      default:
        return Smartphone;
    }
  };

  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Active now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
                      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2))',
                    }}
                  >
                    <Smartphone className="w-5 h-5" style={{ color: '#FB923C' }} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Active Sessions</h2>
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
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, index) => {
                    const Icon = getDeviceIcon(session.deviceType);

                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-2xl"
                        style={{
                          background: session.isCurrent
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))'
                            : 'rgba(255, 255, 255, 0.03)',
                          border: session.isCurrent
                            ? '1px solid rgba(59, 130, 246, 0.3)'
                            : '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                            }}
                          >
                            <Icon className="w-5 h-5" style={{ color: '#60A5FA' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium text-sm">{session.deviceName}</p>
                              {session.isCurrent && (
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                                  style={{
                                    background: 'rgba(34, 197, 94, 0.2)',
                                    color: '#4ADE80',
                                  }}
                                >
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-white/60 text-xs mt-1">{session.browser}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-white/60">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatLastActive(session.lastActive)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{session.location}</span>
                              </div>
                            </div>
                            {!session.isCurrent && (
                              <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleRevokeSession(session.id)}
                                className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                                style={{
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  color: '#F87171',
                                }}
                              >
                                <LogOut className="w-3 h-3" />
                                Revoke
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {!loading && sessions.filter((s) => !s.isCurrent).length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRevokeAllSessions}
                  className="w-full mt-4 h-12 rounded-xl font-medium"
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#F87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  Revoke All Other Sessions
                </motion.button>
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

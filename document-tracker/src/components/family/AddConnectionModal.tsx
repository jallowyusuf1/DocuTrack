import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Heart, Users as UsersIcon, Baby, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sendConnectionRequest } from '../../services/social';

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const relationships = [
  { value: 'spouse', icon: Heart, label: 'Spouse', color: 'from-pink-500 to-rose-500', iconColor: 'text-pink-400' },
  { value: 'parent', icon: UserCheck, label: 'Parent', color: 'from-blue-500 to-indigo-500', iconColor: 'text-blue-400' },
  { value: 'child', icon: Baby, label: 'Child', color: 'from-green-500 to-emerald-500', iconColor: 'text-green-400' },
  { value: 'sibling', icon: UsersIcon, label: 'Sibling', color: 'from-purple-500 to-violet-500', iconColor: 'text-purple-400' },
  { value: 'friend', icon: UserPlus, label: 'Friend', color: 'from-orange-500 to-amber-500', iconColor: 'text-orange-400' },
  { value: 'other', icon: UserCheck, label: 'Other', color: 'from-gray-500 to-slate-500', iconColor: 'text-gray-400' },
];

export default function AddConnectionModal({ isOpen, onClose, onSuccess }: AddConnectionModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('friend');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendConnectionRequest(email, relationship);
      onSuccess();
      setEmail('');
      setRelationship('friend');
    } catch (err: any) {
      setError(err.message || 'Failed to send connection request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Just blur (Apple style) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100]"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          />

          {/* Modal - Glass morphism with app theme visible */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[101] overflow-hidden flex flex-col"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'calc(100% - 3rem)',
              maxWidth: '600px',
              maxHeight: 'calc(100vh - 3rem)',
              background: 'rgba(35, 29, 51, 0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 92, 246, 0.2)',
            }}
          >
            <div className="p-6 md:p-8 overflow-y-auto flex-1" style={{ overscrollBehavior: 'contain' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Add Member
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 pb-4">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-400" />
                    Search by email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 md:py-[14px] rounded-xl text-white placeholder:text-white/40 transition-all text-base md:text-[19px]"
                    style={{
                      background: 'rgba(42, 38, 64, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      height: '50px',
                    }}
                    data-tablet-input="true"
                    required
                  />
                  <style>{`
                    @media (min-width: 768px) {
                      [data-tablet-input="true"] {
                        height: 56px !important;
                      }
                    }
                  `}</style>
                </div>

                {/* Relationship Selector - Large Icon Buttons */}
                <div>
                  <label className="block text-sm md:text-base font-medium text-white mb-4">
                    Relationship
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-tablet-relationship="true">
                    <style>{`
                      @media (min-width: 768px) {
                        [data-tablet-relationship="true"] {
                          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                        }
                      }
                    `}</style>
                    {relationships.map((rel) => {
                      const Icon = rel.icon;
                      const isSelected = relationship === rel.value;

                      return (
                        <motion.button
                          key={rel.value}
                          type="button"
                          onClick={() => setRelationship(rel.value)}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className={`rounded-2xl transition-all duration-300 text-center ${
                            isSelected
                              ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-transparent'
                              : ''
                          }`}
                          style={{
                            background: isSelected
                              ? 'rgba(139, 92, 246, 0.2)'
                              : 'rgba(42, 38, 64, 0.4)',
                            backdropFilter: 'blur(10px)',
                            border: isSelected
                              ? '1px solid rgba(139, 92, 246, 0.5)'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '24px',
                            width: '100%',
                            aspectRatio: '1',
                          }}
                          data-tablet-relationship-card="true"
                        >
                          <style>{`
                            @media (min-width: 768px) {
                              [data-tablet-relationship-card="true"] {
                                width: 180px !important;
                                height: 180px !important;
                                padding: 24px !important;
                              }
                            }
                          `}</style>
                          <div
                            className={`rounded-full bg-gradient-to-br ${rel.color} flex items-center justify-center mx-auto mb-3 ${
                              isSelected ? 'scale-110 shadow-lg' : 'scale-100'
                            } transition-all duration-300`}
                            style={{
                              width: '48px',
                              height: '48px',
                              boxShadow: isSelected
                                ? `0 10px 30px rgba(139, 92, 246, 0.5)`
                                : 'none',
                            }}
                            data-tablet-relationship-icon="true"
                          >
                            <style>{`
                              @media (min-width: 768px) {
                                [data-tablet-relationship-icon="true"] {
                                  width: 56px !important;
                                  height: 56px !important;
                                }
                              }
                            `}</style>
                            <Icon className={`w-8 h-8 text-white`} data-tablet-relationship-icon-svg="true" />
                            <style>{`
                              @media (min-width: 768px) {
                                [data-tablet-relationship-icon-svg="true"] {
                                  width: 56px !important;
                                  height: 56px !important;
                                }
                              }
                            `}</style>
                          </div>
                          <p
                            className={`text-sm md:text-base font-semibold ${
                              isSelected ? 'text-white' : 'text-white/70'
                            }`}
                          >
                            {rel.label}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading || !email}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send Invitation'
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

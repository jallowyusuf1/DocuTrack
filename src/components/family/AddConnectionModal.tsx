import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Heart, Users as UsersIcon, Baby, UserCheck, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sendConnectionRequest } from '../../services/social';

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const relationships = [
  { value: 'spouse', icon: Heart, label: 'Spouse', color: 'from-pink-500 to-rose-500', glowColor: 'rgba(236, 72, 153, 0.4)' },
  { value: 'parent', icon: UserCheck, label: 'Parent', color: 'from-blue-500 to-indigo-500', glowColor: 'rgba(59, 130, 246, 0.4)' },
  { value: 'child', icon: Baby, label: 'Child', color: 'from-green-500 to-emerald-500', glowColor: 'rgba(34, 197, 94, 0.4)' },
  { value: 'sibling', icon: UsersIcon, label: 'Sibling', color: 'from-purple-500 to-violet-500', glowColor: 'rgba(139, 92, 246, 0.4)' },
  { value: 'friend', icon: UserPlus, label: 'Friend', color: 'from-orange-500 to-amber-500', glowColor: 'rgba(251, 146, 60, 0.4)' },
  { value: 'other', icon: UserCheck, label: 'Other', color: 'from-gray-500 to-slate-500', glowColor: 'rgba(148, 163, 184, 0.4)' },
];

export default function AddConnectionModal({ isOpen, onClose, onSuccess }: AddConnectionModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('spouse');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fade error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendConnectionRequest(email, relationship);
      onSuccess();
      setEmail('');
      setRelationship('spouse');
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
          {/* Backdrop - Heavy Liquid Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100]"
            style={{
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              background: 'rgba(0, 0, 0, 0.4)',
            }}
          />

          {/* Modal - Premium Liquid Glass */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="w-full max-w-[95vw] md:max-w-[620px] rounded-3xl md:rounded-[32px] overflow-hidden relative"
              style={{
                background: 'rgba(26, 22, 37, 0.85)',
                backdropFilter: 'blur(50px)',
                WebkitBackdropFilter: 'blur(50px)',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 30px 100px rgba(0, 0, 0, 0.9), 0 0 80px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                maxHeight: '90vh',
              }}
            >
              {/* Animated Liquid Orb Background */}
              <motion.div
                className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full opacity-20 blur-[100px]"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                }}
                animate={{
                  x: [0, 30, 0],
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Glass Reflection Sweep */}
              <motion.div
                className="absolute inset-0 opacity-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)',
                }}
                animate={{
                  x: ['-100%', '200%'],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                  repeatDelay: 2,
                }}
              />

              <div className="relative p-6 md:p-8 overflow-y-auto" style={{ maxHeight: '90vh' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className="flex items-center gap-3 md:gap-4">
                    <motion.div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center relative"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      style={{
                        boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <UserPlus className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      {/* Icon Glow */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)',
                        }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-0.5" style={{ letterSpacing: '-0.02em' }}>
                        Add Member
                      </h2>
                      <p className="text-xs md:text-sm text-white/50">Invite someone to your family</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: 'rgba(42, 38, 64, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <X className="w-5 h-5 text-white/80" />
                  </motion.button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-7">
                  {/* Email Input - Liquid Glass Style */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-400" />
                      <span>Email Address</span>
                    </label>
                    <div className="relative group">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="member@example.com"
                        className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl md:rounded-2xl text-white placeholder:text-white/30 transition-all text-sm md:text-base focus:outline-none"
                        style={{
                          background: 'rgba(42, 38, 64, 0.4)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
                        }}
                        onFocus={(e) => {
                          e.target.style.border = '1px solid rgba(139, 92, 246, 0.5)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1), inset 0 2px 8px rgba(0, 0, 0, 0.3)';
                        }}
                        onBlur={(e) => {
                          e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                          e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.3)';
                        }}
                        required
                      />
                      {/* Input Glow on Focus */}
                      <motion.div
                        className="absolute inset-0 rounded-xl md:rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"
                        style={{
                          boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Relationship Selector - Redesigned Liquid Glass Cards */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Relationship Type</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                      {relationships.map((rel) => {
                        const Icon = rel.icon;
                        const isSelected = relationship === rel.value;

                        return (
                          <motion.button
                            key={rel.value}
                            type="button"
                            onClick={() => setRelationship(rel.value)}
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative rounded-2xl md:rounded-3xl transition-all duration-500 overflow-hidden group"
                            style={{
                              background: isSelected
                                ? 'rgba(139, 92, 246, 0.15)'
                                : 'rgba(42, 38, 64, 0.3)',
                              backdropFilter: 'blur(15px)',
                              border: isSelected
                                ? '2px solid rgba(139, 92, 246, 0.6)'
                                : '1px solid rgba(255, 255, 255, 0.08)',
                              padding: '16px 12px',
                              boxShadow: isSelected
                                ? `0 0 30px ${rel.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                                : 'inset 0 1px 8px rgba(0, 0, 0, 0.3)',
                            }}
                          >
                            {/* Animated Gradient Border on Hover */}
                            {isSelected && (
                              <motion.div
                                className="absolute inset-0 rounded-2xl md:rounded-3xl"
                                style={{
                                  background: `linear-gradient(135deg, ${rel.glowColor}, transparent)`,
                                  opacity: 0.3,
                                }}
                                animate={{
                                  rotate: [0, 360],
                                }}
                                transition={{
                                  duration: 8,
                                  repeat: Infinity,
                                  ease: 'linear',
                                }}
                              />
                            )}

                            {/* Glass Reflection */}
                            <motion.div
                              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                              style={{
                                background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                              }}
                              animate={{
                                x: ['-100%', '200%'],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            />

                            <div className="relative flex flex-col items-center gap-2 md:gap-3">
                              {/* Icon */}
                              <motion.div
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br ${rel.color} flex items-center justify-center`}
                                animate={isSelected ? {
                                  scale: [1, 1.1, 1],
                                } : {}}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                                style={{
                                  boxShadow: isSelected
                                    ? `0 8px 25px ${rel.glowColor}`
                                    : '0 4px 12px rgba(0, 0, 0, 0.3)',
                                }}
                              >
                                <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                              </motion.div>

                              {/* Label */}
                              <p
                                className={`text-xs md:text-sm font-semibold transition-colors ${
                                  isSelected ? 'text-white' : 'text-white/60'
                                }`}
                              >
                                {rel.label}
                              </p>

                              {/* Selection Indicator */}
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                                  style={{
                                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.6)',
                                  }}
                                >
                                  <motion.div
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="w-2.5 h-2.5 md:w-3 md:h-3 border-2 border-white rounded-sm"
                                    style={{
                                      borderRight: 'none',
                                      borderTop: 'none',
                                      transform: 'rotate(-45deg) translateY(-1px)',
                                    }}
                                  />
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Error Message - Auto Fade */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="p-4 rounded-2xl relative overflow-hidden"
                        style={{
                          background: 'rgba(239, 68, 68, 0.12)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          boxShadow: '0 0 25px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        {/* Animated Error Glow */}
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.2), transparent 70%)',
                          }}
                          animate={{
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                        <p className="text-red-300 text-sm md:text-base font-medium relative z-10">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button - Premium Liquid Glass */}
                  <motion.button
                    type="submit"
                    disabled={loading || !email}
                    whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full h-14 md:h-16 rounded-2xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group text-base md:text-lg"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      boxShadow: '0 15px 50px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {/* Animated Shimmer Effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                      }}
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />

                    {/* Button Glow */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)',
                      }}
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />

                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <motion.div
                            className="w-5 h-5 md:w-6 md:h-6 border-3 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                          <span>Sending Invitation...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                          <span>Send Invitation</span>
                        </>
                      )}
                    </span>
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

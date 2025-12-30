import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Shield, Bell, FolderSearch, Lock, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../../utils/animations';

export default function Features() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Smart Expiration Tracking',
      description: 'Never miss a deadline with intelligent reminders and automatic tracking of document expiration dates.',
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your documents are encrypted with AES-256 encryption and stored securely in the cloud.',
    },
    {
      icon: Bell,
      title: 'Customizable Notifications',
      description: 'Set reminders for 30, 7, and 1 day before expiration. Get notified via email, SMS, or push notifications.',
    },
    {
      icon: FolderSearch,
      title: 'Advanced Search',
      description: 'Quickly find any document using powerful search filters by name, type, category, or expiration date.',
    },
    {
      icon: Lock,
      title: 'Document Locking',
      description: 'Protect sensitive documents with password protection and biometric authentication.',
    },
    {
      icon: Users,
      title: 'Family Sharing',
      description: 'Share documents securely with family members and manage access permissions.',
    },
    {
      icon: Zap,
      title: 'Quick Add',
      description: 'Add documents in seconds using our mobile camera capture with automatic document detection.',
    },
    {
      icon: Calendar,
      title: 'Important Dates Calendar',
      description: 'Track important dates alongside your documents in a unified calendar view.',
    },
  ];

  return (
    <div className="min-h-screen pb-[72px] relative" style={{ background: '#000000' }}>
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0) 70%)',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[250px] h-[250px] rounded-full blur-[100px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0) 70%)',
            transform: 'translate(50%, 50%)',
          }}
        />
      </div>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-5 py-4 flex items-center gap-4"
        style={{
          background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.3) 100%)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(50px) saturate(150%)',
          WebkitBackdropFilter: 'blur(50px) saturate(150%)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            triggerHaptic('light');
            navigate(-1);
          }}
          className="p-2 rounded-lg transition-colors"
          style={{
            background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.16)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            boxShadow: '0 18px 55px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-white/80" />
          <h1 className="text-xl font-bold text-white">Features</h1>
        </div>
      </header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-6 max-w-4xl mx-auto relative z-10"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Everything You Need to Manage Documents</h2>
          <p className="text-white/80 text-lg">
            DocuTrackr provides all the tools you need to stay organized and never miss an important deadline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl p-6"
                style={{
                  background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.3) 100%)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(50px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(50px) saturate(150%)',
                  boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.04) 100%)',
                      border: '1px solid rgba(255,255,255,0.16)',
                      backdropFilter: 'blur(18px)',
                      WebkitBackdropFilter: 'blur(18px)',
                      boxShadow: '0 18px 55px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)',
                    }}
                  >
                    <Icon className="w-6 h-6 text-white/80" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
            className="px-8 py-4 text-base font-bold rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.04) 100%)',
              border: '1px solid rgba(255,255,255,0.16)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              boxShadow: '0 18px 55px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)',
              color: 'rgba(255, 255, 255, 0.92)',
            }}
          >
            Get Started Free
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

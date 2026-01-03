import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, Server, Key, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../../utils/animations';

export default function Security() {
  const navigate = useNavigate();

  const securityFeatures = [
    {
      icon: Lock,
      title: 'AES-256 Encryption',
      description: 'All documents are encrypted using industry-standard AES-256 encryption, the same level used by banks and government agencies.',
    },
    {
      icon: Server,
      title: 'Secure Cloud Storage',
      description: 'Your data is stored in secure, SOC 2 compliant data centers with redundant backups and 99.9% uptime guarantee.',
    },
    {
      icon: Key,
      title: 'Password Protection',
      description: 'Add an extra layer of security to sensitive documents with password protection and biometric authentication.',
    },
    {
      icon: Eye,
      title: 'Zero-Knowledge Architecture',
      description: 'We use zero-knowledge encryption, meaning we cannot access your documents even if requested by authorities.',
    },
    {
      icon: Shield,
      title: 'Two-Factor Authentication',
      description: 'Enable 2FA to protect your account with an additional security layer beyond your password.',
    },
    {
      icon: CheckCircle,
      title: 'Regular Security Audits',
      description: 'We conduct regular security audits and penetration testing to ensure your data remains secure.',
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
        className="sticky top-0 z-10 px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-3 sm:gap-4"
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
          className="p-1.5 sm:p-2 rounded-lg transition-colors"
          style={{
            background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.16)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            boxShadow: '0 18px 55px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </motion.button>
        <div className="flex items-center gap-2 sm:gap-3">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
          <h1 className="text-lg sm:text-xl font-bold text-white">Security</h1>
        </div>
      </header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 sm:px-5 py-5 sm:py-6 max-w-4xl mx-auto relative z-10"
      >
        <div className="mb-6 sm:mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.04) 100%)',
              border: '1px solid rgba(255,255,255,0.16)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              boxShadow: '0 18px 55px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white/80" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Bank-Level Security</h2>
          <p className="text-white/80 text-base sm:text-lg">
            Your documents are protected with the same security standards used by financial institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {securityFeatures.map((feature, index) => {
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

        {/* Security Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.3) 100%)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(50px) saturate(150%)',
            WebkitBackdropFilter: 'blur(50px) saturate(150%)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)',
          }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Security Certifications</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <div
              className="px-4 py-2 rounded-lg"
              style={{
                background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.16)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: '0 18px 55px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              <span className="text-white/80 text-sm">SOC 2 Compliant</span>
            </div>
            <div
              className="px-4 py-2 rounded-lg"
              style={{
                background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.16)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: '0 18px 55px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              <span className="text-white/80 text-sm">GDPR Compliant</span>
            </div>
            <div
              className="px-4 py-2 rounded-lg"
              style={{
                background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.16)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: '0 18px 55px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              <span className="text-white/80 text-sm">ISO 27001</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

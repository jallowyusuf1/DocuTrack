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
    <div className="min-h-screen pb-[72px]">
      {/* Header */}
      <header 
        className="sticky top-0 z-10 px-5 py-4 flex items-center gap-4"
        style={{
          background: 'rgba(35, 29, 51, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            triggerHaptic('light');
            navigate(-1);
          }}
          className="p-2 rounded-lg hover:bg-purple-500/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl font-bold text-white">Security</h1>
        </div>
      </header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-6 max-w-4xl mx-auto"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
            }}
          >
            <Shield className="w-10 h-10 text-purple-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Bank-Level Security</h2>
          <p className="text-white/70 text-lg">
            Your documents are protected with the same security standards used by financial institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                  background: 'rgba(42, 38, 64, 0.7)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                    }}
                  >
                    <Icon className="w-6 h-6 text-purple-400" />
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
            background: 'rgba(42, 38, 64, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Security Certifications</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-white/80 text-sm">SOC 2 Compliant</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-white/80 text-sm">GDPR Compliant</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-white/80 text-sm">ISO 27001</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

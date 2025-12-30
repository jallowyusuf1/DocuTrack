import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown, Shield, FileText } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';
import TermsOfService from '../../pages/legal/TermsOfService';
import PrivacyPolicy from '../../pages/legal/PrivacyPolicy';

interface TermsModalProps {
  type: 'terms' | 'privacy';
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function TermsModal({ type, isOpen, onAccept, onDecline }: TermsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      // Reset scroll position when modal opens
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isBottom = scrollTop + clientHeight >= scrollHeight - 50;

      if (isBottom && !hasScrolledToBottom) {
        setHasScrolledToBottom(true);
        triggerHaptic('light');
      }
    }
  };

  if (!isOpen) return null;

  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  const Icon = type === 'terms' ? FileText : Shield;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col"
        style={{
          background: 'rgba(26, 22, 37, 0.98)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 h-16"
          style={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              triggerHaptic('light');
              onDecline();
            }}
            className="p-2 rounded-lg hover:bg-blue-600/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6" style={{ color: '#60A5FA' }} />
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Scrollable Content */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-5 py-6"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(37, 99, 235, 0.5) transparent',
          }}
        >
          <div className="max-w-4xl mx-auto">
            {type === 'terms' ? (
              <div className="space-y-6">
                <p className="text-sm" style={{ color: '#60A5FA' }}>
                  Last updated: {new Date().toLocaleDateString()}
                </p>
                <section>
                  <h2 className="text-lg font-bold text-white mb-3">1. Acceptance of Terms</h2>
                  <p className="text-sm" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    By accessing and using DocuTrackr, you accept and agree to be bound by these Terms of Service.
                    If you do not agree to these terms, please do not use our service.
                  </p>
                </section>
                <section>
                  <h2 className="text-lg font-bold text-white mb-3">2. Description of Service</h2>
                  <p className="text-sm" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    DocuTrackr is a document tracking application that helps you manage document expiration dates
                    and receive reminders. We provide tools to organize, track, and receive notifications about
                    your important documents.
                  </p>
                </section>
                <section>
                  <h2 className="text-lg font-bold text-white mb-3">3. User Accounts</h2>
                  <p className="text-sm mb-4" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    To use DocuTrackr, you must:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm ml-4" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account</li>
                    <li>Notify us immediately of any unauthorized access</li>
                    <li>Be at least 13 years of age</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-lg font-bold text-white mb-3">4. User Responsibilities</h2>
                  <p className="text-sm mb-4" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    You agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm ml-4" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    <li>Use the service only for lawful purposes</li>
                    <li>Not upload malicious code or harmful content</li>
                    <li>Not attempt to gain unauthorized access to the service</li>
                    <li>Not use the service to violate any laws or regulations</li>
                    <li>Maintain the accuracy of your document information</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-lg font-bold text-white mb-3">5. Intellectual Property</h2>
                  <p className="text-sm" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    All content, features, and functionality of DocuTrackr are owned by us and are protected by
                    international copyright, trademark, and other intellectual property laws.
                  </p>
                </section>
                <section>
                  <h2 className="text-lg font-bold text-white mb-3">6. Service Availability</h2>
                  <p className="text-sm" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    We strive to provide reliable service but do not guarantee uninterrupted or error-free operation.
                    We reserve the right to modify, suspend, or discontinue any part of the service at any time.
                  </p>
                </section>
                <section>
                  <h2 className="text-lg font-bold text-white mb-3">7. Limitation of Liability</h2>
                  <p className="text-sm" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    DocuTrackr is provided "as is" without warranties of any kind. We are not liable for any
                    damages arising from your use of the service.
                  </p>
                </section>
                <section>
                  <h2 className="text-lg font-bold text-white mb-3">8. Contact Information</h2>
                  <p className="text-sm" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    For questions about these Terms of Service, please contact us through the app's support
                    features or email us at legal@doctrack.app
                  </p>
                </section>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm" style={{ color: '#60A5FA' }}>
                  Last updated: {new Date().toLocaleDateString()}
                </p>
                <section>
                  <h2 className="text-lg font-bold text-white mb-3">1. Information We Collect</h2>
                  <p className="text-sm mb-4" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    DocuTrackr collects the following information to provide our services:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm ml-4" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    <li>Account information (email, name)</li>
                    <li>Document information (names, expiration dates, images)</li>
                    <li>Device information for app functionality</li>
                    <li>Usage data to improve our services</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-lg font-bold text-white mb-3">2. How We Use Your Information</h2>
                  <p className="text-sm mb-4" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    We use your information to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm ml-4" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    <li>Provide document tracking and reminder services</li>
                    <li>Send expiration notifications</li>
                    <li>Improve app functionality and user experience</li>
                    <li>Ensure app security and prevent fraud</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-lg font-bold text-white mb-3">3. Data Storage and Security</h2>
                  <p className="text-sm" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    Your data is stored securely using Supabase, which provides enterprise-grade security.
                    All data is encrypted in transit and at rest.
                  </p>
                </section>
                <section>
                  <h2 className="text-lg font-bold text-white mb-3">4. Data Sharing</h2>
                  <p className="text-sm" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    We do not sell, trade, or rent your personal information to third parties.
                  </p>
                </section>
                <section>
                  <h2 className="text-lg font-bold text-white mb-3">5. Your Rights</h2>
                  <p className="text-sm mb-4" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm ml-4" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    <li>Access your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and data</li>
                    <li>Export your data</li>
                    <li>Opt-out of non-essential communications</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-lg font-bold text-white mb-3">6. Contact Us</h2>
                  <p className="text-sm" style={{ color: '#C7C3D9', lineHeight: '1.7' }}>
                    If you have questions about this Privacy Policy, please contact us through the app's
                    support features or email us at privacy@doctrack.app
                  </p>
                </section>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div
          className="px-4 py-4"
          style={{
            background: 'rgba(26, 22, 37, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <AnimatePresence>
            {!hasScrolledToBottom && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 mb-3"
                style={{ color: '#60A5FA' }}
              >
                <ArrowDown className="w-4 h-4 animate-bounce" />
                <span className="text-sm">Scroll to read all terms</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                triggerHaptic('light');
                onDecline();
              }}
              className="flex-1 h-12 rounded-xl font-semibold text-white transition-all"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              Decline
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (hasScrolledToBottom) {
                  triggerHaptic('medium');
                  onAccept();
                }
              }}
              disabled={!hasScrolledToBottom}
              className="flex-1 h-12 rounded-xl font-semibold text-white transition-all"
              style={{
                background: hasScrolledToBottom
                  ? 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)'
                  : 'rgba(107, 102, 126, 0.3)',
                boxShadow: hasScrolledToBottom
                  ? '0 4px 20px rgba(37, 99, 235, 0.5)'
                  : 'none',
                cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed',
                opacity: hasScrolledToBottom ? 1 : 0.5,
              }}
            >
              Accept
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../../utils/animations';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

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
          <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
        </div>
      </header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-6 max-w-4xl mx-auto"
      >
        <div 
          className="rounded-2xl p-6 space-y-6"
          style={{
            background: 'rgba(42, 38, 64, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <p className="text-sm" style={{ color: '#A78BFA' }}>
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Information We Collect</h2>
            <p className="text-sm mb-4" style={{ color: '#C7C3D9' }}>
              DocuTrack collects the following information to provide our services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-4" style={{ color: '#C7C3D9' }}>
              <li>Account information (email, name)</li>
              <li>Document information (names, expiration dates, images)</li>
              <li>Device information for app functionality</li>
              <li>Usage data to improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p className="text-sm mb-4" style={{ color: '#C7C3D9' }}>
              We use your information to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-4" style={{ color: '#C7C3D9' }}>
              <li>Provide document tracking and reminder services</li>
              <li>Send expiration notifications</li>
              <li>Improve app functionality and user experience</li>
              <li>Ensure app security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Data Storage and Security</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              Your data is stored securely using Supabase, which provides enterprise-grade security. 
              All data is encrypted in transit and at rest. We implement industry-standard security 
              measures to protect your information from unauthorized access, alteration, or disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Data Sharing</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              We do not sell, trade, or rent your personal information to third parties. We may share 
              data only with trusted service providers who assist in operating our app, subject to 
              strict confidentiality agreements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Your Rights</h2>
            <p className="text-sm mb-4" style={{ color: '#C7C3D9' }}>
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-4" style={{ color: '#C7C3D9' }}>
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt-out of non-essential communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Cookies and Tracking</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              We use essential cookies for app functionality. We do not use tracking cookies or 
              third-party analytics that collect personal information without your consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Children's Privacy</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              Our app is not intended for users under 13 years of age. We do not knowingly collect 
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Changes to This Policy</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Contact Us</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              If you have questions about this Privacy Policy, please contact us through the app's 
              support features or email us at privacy@doctrack.app
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}


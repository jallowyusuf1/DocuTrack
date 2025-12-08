import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../../utils/animations';

export default function TermsOfService() {
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
          <FileText className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl font-bold text-white">Terms of Service</h1>
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
            <h2 className="text-lg font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              By accessing and using DocuTrack, you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Description of Service</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              DocuTrack is a document tracking application that helps you manage document expiration dates 
              and receive reminders. We provide tools to organize, track, and receive notifications about 
              your important documents.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. User Accounts</h2>
            <p className="text-sm mb-4" style={{ color: '#C7C3D9' }}>
              To use DocuTrack, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-4" style={{ color: '#C7C3D9' }}>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be at least 13 years of age</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. User Responsibilities</h2>
            <p className="text-sm mb-4" style={{ color: '#C7C3D9' }}>
              You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-4" style={{ color: '#C7C3D9' }}>
              <li>Use the service only for lawful purposes</li>
              <li>Not upload malicious code or harmful content</li>
              <li>Not attempt to gain unauthorized access to the service</li>
              <li>Not use the service to violate any laws or regulations</li>
              <li>Maintain the accuracy of your document information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Intellectual Property</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              All content, features, and functionality of DocuTrack are owned by us and are protected by 
              international copyright, trademark, and other intellectual property laws. You may not copy, 
              modify, or distribute any part of the service without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. User Content</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              You retain ownership of all content you upload to DocuTrack. By uploading content, you grant 
              us a license to store, process, and display that content solely for the purpose of providing 
              our services to you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Service Availability</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              We strive to provide reliable service but do not guarantee uninterrupted or error-free operation. 
              We reserve the right to modify, suspend, or discontinue any part of the service at any time 
              with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Limitation of Liability</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              DocuTrack is provided "as is" without warranties of any kind. We are not liable for any 
              damages arising from your use of the service, including but not limited to data loss, 
              missed notifications, or document expiration. You are responsible for verifying important 
              document dates independently.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Indemnification</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              You agree to indemnify and hold us harmless from any claims, damages, or expenses arising 
              from your use of the service or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Termination</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              We reserve the right to terminate or suspend your account at any time for violation of these 
              terms. You may delete your account at any time through the app settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">11. Changes to Terms</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              We may update these Terms of Service from time to time. Continued use of the service after 
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">12. Governing Law</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              These terms are governed by the laws of the jurisdiction in which we operate. Any disputes 
              will be resolved through binding arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">13. Contact Information</h2>
            <p className="text-sm" style={{ color: '#C7C3D9' }}>
              For questions about these Terms of Service, please contact us through the app's support 
              features or email us at legal@doctrack.app
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}

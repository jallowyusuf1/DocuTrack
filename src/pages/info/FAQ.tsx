import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../../utils/animations';

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I add my first document?',
          a: 'Click the "+" button in the header or navigate to "Add Document". You can take a photo with your camera or upload from your gallery. Fill in the document details and expiration date, then save.',
        },
        {
          q: 'What file types are supported?',
          a: 'DocuTrackr supports images (JPG, PNG) and PDF files. Images are automatically compressed to save storage space.',
        },
        {
          q: 'How do I set up expiration reminders?',
          a: 'When adding or editing a document, set the expiration date. DocuTrackr will automatically send reminders at 30 days, 7 days, and 1 day before expiration.',
        },
      ],
    },
    {
      category: 'Features',
      questions: [
        {
          q: 'Can I lock sensitive documents?',
          a: 'Yes! You can lock any document with a password. Locked documents require authentication to view and cannot be accessed without the password.',
        },
        {
          q: 'How does family sharing work?',
          a: 'You can connect with family members by email. Once connected, you can share documents with them and set permissions (view-only or edit).',
        },
        {
          q: 'Can I search for documents?',
          a: 'Yes! Use the search bar in the documents page to search by name, type, or category. You can also filter by expiration date.',
        },
      ],
    },
    {
      category: 'Account & Security',
      questions: [
        {
          q: 'How do I change my password?',
          a: 'Go to Profile > Change Password. Enter your current password and your new password twice to confirm.',
        },
        {
          q: 'Is my data secure?',
          a: 'Yes! All documents are encrypted with AES-256 encryption. We use zero-knowledge architecture, meaning we cannot access your documents even if requested.',
        },
        {
          q: 'Can I export my data?',
          a: 'Yes! Go to Profile > Export Data to download all your documents and data in a ZIP file.',
        },
      ],
    },
    {
      category: 'Billing & Plans',
      questions: [
        {
          q: 'Is DocuTrackr free?',
          a: 'Yes! DocuTrackr is completely free to use. We offer all core features at no cost.',
        },
        {
          q: 'Are there any storage limits?',
          a: 'Free accounts have generous storage limits. If you need more storage, contact our support team.',
        },
      ],
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
          <HelpCircle className="w-6 h-6 text-white/80" />
          <h1 className="text-xl font-bold text-white">Frequently Asked Questions</h1>
        </div>
      </header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-6 max-w-4xl mx-auto relative z-10"
      >
        {faqs.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">{section.category}</h2>
            <div className="space-y-3">
              {section.questions.map((faq, index) => {
                const globalIndex = sectionIndex * 10 + index;
                const isOpen = openIndex === globalIndex;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl overflow-hidden"
                    style={{
                      background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.3) 100%)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(50px) saturate(150%)',
                      WebkitBackdropFilter: 'blur(50px) saturate(150%)',
                      boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)',
                    }}
                  >
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setOpenIndex(isOpen ? null : globalIndex);
                      }}
                      className="w-full p-4 md:p-6 flex items-center justify-between text-left"
                    >
                      <span className="text-white font-medium text-sm md:text-base pr-4">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-white/60 transition-transform flex-shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <motion.div
                      initial={false}
                      animate={{
                        height: isOpen ? 'auto' : 0,
                        opacity: isOpen ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-6 pb-4 md:pb-6 text-white/70 text-sm md:text-base leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.3) 100%)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(50px) saturate(150%)',
            WebkitBackdropFilter: 'blur(50px) saturate(150%)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)',
          }}
        >
          <h3 className="text-xl font-semibold text-white mb-2">Still Have Questions?</h3>
          <p className="text-white/70 text-sm mb-4">Visit our Help Center or contact support.</p>
          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/help')}
              className="px-6 py-3 text-sm font-semibold rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.16)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: '0 18px 55px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)',
                color: 'rgba(255, 255, 255, 0.92)',
              }}
            >
              Help Center
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = 'mailto:support@docutrackr.com'}
              className="px-6 py-3 text-sm font-semibold rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.16)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: '0 18px 55px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)',
                color: 'rgba(255, 255, 255, 0.92)',
              }}
            >
              Contact Support
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

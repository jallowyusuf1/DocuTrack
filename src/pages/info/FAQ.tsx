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
          <HelpCircle className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl font-bold text-white">Frequently Asked Questions</h1>
        </div>
      </header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-6 max-w-4xl mx-auto"
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
                      background: 'rgba(42, 38, 64, 0.7)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
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
            background: 'rgba(42, 38, 64, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h3 className="text-xl font-semibold text-white mb-2">Still Have Questions?</h3>
          <p className="text-white/70 text-sm mb-4">Visit our Help Center or contact support.</p>
          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/help')}
              className="px-6 py-3 text-sm font-semibold text-white rounded-full"
              style={{
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
              }}
            >
              Help Center
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = 'mailto:support@docutrackr.com'}
              className="px-6 py-3 text-sm font-semibold text-white rounded-full"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
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

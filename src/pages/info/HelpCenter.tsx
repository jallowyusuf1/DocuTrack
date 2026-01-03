import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, HelpCircle, Book, MessageCircle, Mail, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../../utils/animations';

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn the basics of DocuTrackr',
      articles: [
        'How to add your first document',
        'Setting up expiration reminders',
        'Understanding document categories',
      ],
    },
    {
      icon: HelpCircle,
      title: 'Account & Settings',
      description: 'Manage your account and preferences',
      articles: [
        'How to change your password',
        'Updating your profile',
        'Notification preferences',
      ],
    },
    {
      icon: MessageCircle,
      title: 'Sharing & Collaboration',
      description: 'Share documents with family members',
      articles: [
        'How to share a document',
        'Managing family connections',
        'Setting document permissions',
      ],
    },
  ];

  const popularArticles = [
    'How do I add a document?',
    'How do I set up reminders?',
    'Can I share documents with family?',
    'How do I lock a document?',
    'What file types are supported?',
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
          <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
          <h1 className="text-lg sm:text-xl font-bold text-white">Help Center</h1>
        </div>
      </header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 sm:px-5 py-5 sm:py-6 max-w-4xl mx-auto relative z-10"
      >
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-white placeholder:text-white/40"
              style={{
                background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.3) 100%)',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(50px) saturate(150%)',
                WebkitBackdropFilter: 'blur(50px) saturate(150%)',
                boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)',
              }}
            />
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Popular Articles</h2>
          <div className="space-y-2">
            {popularArticles.map((article, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate('/faq')}
                className="w-full flex items-center justify-between p-4 rounded-xl transition-colors"
                style={{
                  background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.3) 100%)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(50px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(50px) saturate(150%)',
                  boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)',
                }}
              >
                <span className="text-white/80 text-sm">{article}</span>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {helpCategories.map((category, index) => {
              const Icon = category.icon;
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
                  <div className="flex items-start gap-4 mb-4">
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
                      <h3 className="text-lg font-semibold text-white mb-1">{category.title}</h3>
                      <p className="text-white/60 text-sm">{category.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <button
                          onClick={() => navigate('/faq')}
                          className="text-white/70 hover:text-white text-sm transition-colors"
                        >
                          • {article}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Contact Support */}
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
          <Mail className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Still Need Help?</h3>
          <p className="text-white/70 text-sm mb-4">Contact our support team for personalized assistance.</p>
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
        </motion.div>
      </motion.div>
    </div>
  );
}

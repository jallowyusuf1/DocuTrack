import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronDown, ChevronRight, Play, FileText, Video, MessageCircle, HelpCircle } from 'lucide-react';
import { popularArticles, videoTutorials, faqs, helpCategories } from '../../data/helpContent';
import type { HelpArticle, VideoTutorial, FAQ } from '../../data/helpContent';
import { triggerHaptic } from '../../utils/animations';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onContactSupport: () => void;
}

export default function HelpPanel({ isOpen, onClose, onContactSupport }: HelpPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  // Search functionality
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return popularArticles;
    const query = searchQuery.toLowerCase();
    return popularArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const toggleArticle = (id: string) => {
    triggerHaptic('light');
    setExpandedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleFaq = (id: string) => {
    triggerHaptic('light');
    setExpandedFaqs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200/30 text-yellow-100 rounded px-1">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[998] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </motion.div>

      <motion.div
        className="fixed top-0 right-0 h-full w-full md:max-w-[400px] z-[999] pointer-events-auto"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.3), inset 1px 0 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-white text-2xl font-bold">How can we help?</h2>
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close help panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-white/50 bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {/* Popular Articles */}
            {selectedArticle ? (
              <div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-white/70 hover:text-white text-sm mb-4 flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to articles
                </button>
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-4">{selectedArticle.title}</h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="whitespace-pre-line text-white/90 leading-relaxed">
                      {highlightMatch(selectedArticle.content, searchQuery)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold text-lg">Popular Articles</h3>
                  </div>
                  <div className="space-y-2">
                    {filteredArticles.map((article) => (
                      <div
                        key={article.id}
                        className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            setSelectedArticle(article);
                          }}
                          className="w-full p-4 text-left flex items-center justify-between text-white hover:text-blue-300 transition-colors"
                        >
                          <span className="font-medium text-sm">{article.title}</span>
                          <ChevronRight className="w-4 h-4 text-white/50" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Video Tutorials */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Video className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-semibold text-lg">Video Tutorials</h3>
                  </div>
                  <div className="space-y-3">
                    {videoTutorials.map((video) => (
                      <div
                        key={video.id}
                        className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Play className="w-6 h-6 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm mb-1">{video.title}</h4>
                            <p className="text-white/60 text-xs mb-2">{video.description}</p>
                            <span className="text-white/50 text-xs">{video.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* FAQs */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-semibold text-lg">Frequently Asked Questions</h3>
                  </div>
                  <div className="space-y-2">
                    {filteredFaqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full p-4 text-left flex items-center justify-between text-white hover:text-green-300 transition-colors"
                        >
                          <span className="font-medium text-sm pr-4">{faq.question}</span>
                          {expandedFaqs.has(faq.id) ? (
                            <ChevronDown className="w-4 h-4 text-white/50 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-white/50 flex-shrink-0" />
                          )}
                        </button>
                        {expandedFaqs.has(faq.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 pb-4 text-white/80 text-sm leading-relaxed"
                          >
                            {highlightMatch(faq.answer, searchQuery)}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Contact Support */}
            <section className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onContactSupport();
                }}
                className="w-full p-4 rounded-xl border border-white/10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 transition-all text-white font-medium flex items-center justify-center gap-2"
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <MessageCircle className="w-5 h-5" />
                Contact Support
              </button>
            </section>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


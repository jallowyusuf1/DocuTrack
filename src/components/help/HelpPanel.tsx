import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronDown, ChevronRight, Play, FileText, Video, MessageCircle, HelpCircle, ExternalLink } from 'lucide-react';
import { popularArticles, videoTutorials, faqs, helpCategories } from '../../data/helpContent';
import type { HelpArticle, VideoTutorial, FAQ } from '../../data/helpContent';
import { triggerHaptic } from '../../utils/animations';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onContactSupport: () => void;
  onLiveChat?: () => void;
}

export default function HelpPanel({ isOpen, onClose, onContactSupport }: HelpPanelProps) {
  const { openLiveChat } = useHelp();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);

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
        className="fixed top-0 right-0 h-full w-full sm:max-w-[400px] md:max-w-[420px] z-[999] pointer-events-auto"
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
        <div className="h-full flex flex-col overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-white/10 flex-shrink-0">
            <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold pr-2">How can we help?</h2>
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Close help panel"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 sm:p-4 border-b border-white/10 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base text-white placeholder:text-white/50 bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-5 md:py-6 space-y-4 sm:space-y-5 md:space-y-6 pb-6 sm:pb-8 md:pb-10">
            {/* Popular Articles */}
            {selectedArticle ? (
              <div>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedArticle(null);
                  }}
                  className="text-white/70 hover:text-white text-xs sm:text-sm mb-3 sm:mb-4 pb-2 flex items-center gap-1.5 sm:gap-2"
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
                  <span>Back to articles</span>
                </button>
                <div className="text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{selectedArticle.title}</h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="whitespace-pre-line text-sm sm:text-base text-white/90 leading-relaxed">
                      {highlightMatch(selectedArticle.content, searchQuery)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <section>
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    <h3 className="text-white font-semibold text-base sm:text-lg">Popular Articles</h3>
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
                          className="w-full p-3 sm:p-4 text-left flex items-center justify-between text-white hover:text-blue-300 transition-colors"
                        >
                          <span className="font-medium text-xs sm:text-sm pr-2">{article.title}</span>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/50 flex-shrink-0" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Video Tutorials */}
                <section>
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    <h3 className="text-white font-semibold text-base sm:text-lg">Video Tutorials</h3>
                  </div>
                  {selectedVideo ? (
                    <div>
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedVideo(null);
                        }}
                        className="text-white/70 hover:text-white text-xs sm:text-sm mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2 pb-2"
                      >
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
                        <span>Back to videos</span>
                      </button>
                      <div className="space-y-3 sm:space-y-4">
                        <h4 className="text-white font-medium text-base sm:text-lg">{selectedVideo.title}</h4>
                        <p className="text-white/70 text-xs sm:text-sm">{selectedVideo.description}</p>
                        {selectedVideo.youtubeId && selectedVideo.youtubeId !== 'placeholder' ? (
                          <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9', background: '#000' }}>
                            <iframe
                              src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?rel=0&modestbranding=1`}
                              className="absolute inset-0 w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={selectedVideo.title}
                            />
                          </div>
                        ) : (
                          <div className="relative w-full rounded-xl overflow-hidden flex items-center justify-center" style={{ aspectRatio: '16/9', background: 'rgba(0,0,0,0.3)' }}>
                            <div className="text-center p-6">
                              <Video className="w-12 h-12 text-white/30 mx-auto mb-3" />
                              <p className="text-white/50 text-sm mb-2">Video coming soon</p>
                              <p className="text-white/40 text-xs">{selectedVideo.title}</p>
                              <p className="text-white/30 text-xs mt-1">{selectedVideo.duration}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {videoTutorials.map((video) => (
                        <button
                          key={video.id}
                          onClick={() => {
                            triggerHaptic('light');
                            setSelectedVideo(video);
                          }}
                          className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-3 sm:p-4 text-left"
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium text-xs sm:text-sm mb-1">{video.title}</h4>
                              <p className="text-white/60 text-xs mb-1 sm:mb-2 line-clamp-2">{video.description}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-white/50 text-xs">{video.duration}</span>
                                {video.youtubeId && video.youtubeId !== 'placeholder' && (
                                  <span className="text-white/40 text-xs flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" />
                                    Watch
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                {/* FAQs */}
                <section>
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    <h3 className="text-white font-semibold text-base sm:text-lg">Frequently Asked Questions</h3>
                  </div>
                  <div className="space-y-2">
                    {filteredFaqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full p-3 sm:p-4 text-left flex items-center justify-between text-white hover:text-green-300 transition-colors"
                        >
                          <span className="font-medium text-xs sm:text-sm pr-2 sm:pr-4">{faq.question}</span>
                          {expandedFaqs.has(faq.id) ? (
                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-white/50 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/50 flex-shrink-0" />
                          )}
                        </button>
                        {expandedFaqs.has(faq.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-3 sm:px-4 pb-3 sm:pb-4 text-white/80 text-xs sm:text-sm leading-relaxed"
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

            {/* Contact Support & Live Chat */}
            <section className="pt-3 sm:pt-4 border-t border-white/10 flex-shrink-0 space-y-2 sm:space-y-3">
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onContactSupport();
                }}
                className="w-full p-3 sm:p-4 rounded-xl border border-white/10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 transition-all text-white font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Contact Support
              </button>
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  openLiveChat();
                  onClose();
                }}
                className="w-full p-3 sm:p-4 rounded-xl border border-white/10 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 transition-all text-white font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Live Chat
              </button>
              <p className="text-white/50 text-xs text-center">
                Live chat: 9 AM - 5 PM EST • Or leave a message anytime
              </p>
            </section>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


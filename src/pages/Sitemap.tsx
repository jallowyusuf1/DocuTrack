import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, FileText, Calendar, Users, Settings, Shield, HelpCircle, BookOpen, FileCode } from 'lucide-react';

interface SitemapLink {
  name: string;
  path: string;
}

interface SitemapCategory {
  title: string;
  icon: any;
  links: SitemapLink[];
}

const sitemapData: SitemapCategory[] = [
  {
    title: 'Main',
    icon: Home,
    links: [
      { name: 'Home', path: '/' },
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Documents', path: '/documents' },
      { name: 'Expiring Soon', path: '/expire-soon' },
      { name: 'Family', path: '/family' },
      { name: 'Dates/Calendar', path: '/dates' },
      { name: 'Profile', path: '/profile' },
      { name: 'Settings', path: '/settings' },
    ],
  },
  {
    title: 'Product',
    icon: FileText,
    links: [
      { name: 'Features', path: '/info/features' },
      { name: 'How It Works', path: '/info/how-it-works' },
      { name: 'Security', path: '/info/security' },
      { name: 'Family Sharing', path: '/info/family-sharing' },
    ],
  },
  {
    title: 'Support',
    icon: HelpCircle,
    links: [
      { name: 'FAQ', path: '/info/faq' },
      { name: 'Help Center', path: '/info/help-center' },
      { name: 'Video Tutorials', path: '/info/tutorials' },
    ],
  },
  {
    title: 'Legal',
    icon: Shield,
    links: [
      { name: 'Terms of Service', path: '/legal/terms' },
      { name: 'Privacy Policy', path: '/legal/privacy' },
      { name: 'Cookie Policy', path: '/legal/cookies' },
      { name: 'Security & Compliance', path: '/info/security' },
    ],
  },
  {
    title: 'Resources',
    icon: BookOpen,
    links: [
      { name: 'Sitemap', path: '/sitemap' },
      { name: 'Changelog', path: '/changelog' },
    ],
  },
];

export default function Sitemap() {
  return (
    <div className="min-h-screen relative" style={{ background: '#000000' }}>
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

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <div className="px-4 md:px-8 py-6">
          <div className="max-w-[1000px] mx-auto">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px) saturate(120%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(120%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  color: 'rgba(255, 255, 255, 0.92)',
                  transition: 'all 0.2s ease',
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="px-4 md:px-8 py-12 md:py-16">
          <div className="max-w-[1000px] mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Sitemap
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base md:text-lg text-white/60"
            >
              All pages on DocuTrackr
            </motion.p>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 md:px-8 pb-24">
          <div className="max-w-[1000px] mx-auto space-y-6">
            {sitemapData.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-[20px] p-8"
                  style={{
                    background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.3) 100%)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(50px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(50px) saturate(150%)',
                    boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Category Title */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.04) 100%)',
                        border: '1px solid rgba(255,255,255,0.16)',
                      }}
                    >
                      <Icon className="w-5 h-5 text-white/80" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                  </div>

                  {/* Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.links.map((link) => (
                      <Link key={link.path} to={link.path}>
                        <motion.div
                          whileHover={{ x: 4, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-3 rounded-xl text-white/80 hover:text-white transition-colors"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <span className="text-base">→ {link.name}</span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 md:px-8 py-12 border-t border-white/10">
          <div className="max-w-[1000px] mx-auto">
            <div className="text-center">
              <p className="text-white/50 text-sm">
                © {new Date().getFullYear()} DocuTrackr. All rights reserved.
              </p>
              <p className="text-white/40 text-xs mt-2">
                Deadline-proof document management
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

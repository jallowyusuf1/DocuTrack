import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { GlassCard } from '../../../components/ui/glass/Glass';
import { SocialIcon } from '../../../components/ui/glass/SocialIcon';
import { MotionInView } from '../../../components/ui/motion/MotionInView';
import { useLanguage } from '../../../contexts/LanguageContext';
import { triggerHaptic } from '../../../utils/animations';

const languages = [
  { code: 'en', flag: '🇺🇸', name: 'English', nativeName: 'English' },
  { code: 'fr', flag: '🇫🇷', name: 'French', nativeName: 'Français' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
  { code: 'ar', flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ur', flag: '🇵🇰', name: 'Urdu', nativeName: 'اردو' },
];

export default function Footer() {
  const { language, changeLanguage } = useLanguage();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  // Close language picker when clicking outside
  useEffect(() => {
    if (!showLanguagePicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.language-picker-container')) {
        setShowLanguagePicker(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showLanguagePicker]);

  return (
    <footer className="relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6 pb-12 md:pb-16">
        <MotionInView preset="fadeUp">
          <GlassCard
            className="p-6 md:p-8"
            style={{
              borderRadius: 30,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 60%, rgba(139,92,246,0.10) 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              <div className="max-w-md">
                <div className="text-white font-semibold text-lg">DocuTrackr</div>
                <div className="text-white/65 text-sm mt-2 leading-relaxed">
                  Track important documents, expiry dates, and life deadlines with a calm, glass‑smooth experience.
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <SocialIcon type="instagram" href="https://instagram.com" label="Instagram" />
                  <SocialIcon type="tiktok" href="https://tiktok.com" label="TikTok" />
                  <SocialIcon type="linkedin" href="https://linkedin.com" label="LinkedIn" />
                  <SocialIcon type="facebook" href="https://facebook.com" label="Facebook" />
                  <SocialIcon type="x" href="https://x.com" label="X" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
                <div className="space-y-2">
                  <div className="text-white/85 font-semibold">Product</div>
                  <a href="#overview" className="block text-white/65 hover:text-white transition-colors">
                    Overview
                  </a>
                  <a href="#features" className="block text-white/65 hover:text-white transition-colors">
                    Features
                  </a>
                  <a href="#security" className="block text-white/65 hover:text-white transition-colors">
                    Security
                  </a>
                </div>
                <div className="space-y-2">
                  <div className="text-white/85 font-semibold">Account</div>
                  <Link to="/login" className="block text-white/65 hover:text-white transition-colors">
                    Sign in
                  </Link>
                  <Link to="/signup" className="block text-white/65 hover:text-white transition-colors">
                    Sign up
                  </Link>
                  <Link to="/forgot-password" className="block text-white/65 hover:text-white transition-colors">
                    Reset password
                  </Link>
                </div>
                <div className="space-y-2">
                  <div className="text-white/85 font-semibold">Legal</div>
                  <Link to="/terms" className="block text-white/65 hover:text-white transition-colors">
                    Terms
                  </Link>
                  <Link to="/privacy" className="block text-white/65 hover:text-white transition-colors">
                    Privacy
                  </Link>
                </div>
              </div>
            </div>

            <div
              className="mt-8 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}
            >
              <div className="text-white/55 text-xs">© {new Date().getFullYear()} DocuTrackr. All rights reserved.</div>
              <div className="flex items-center gap-3 language-picker-container">
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('light');
                      setShowLanguagePicker(!showLanguagePicker);
                    }}
                    className="flex items-center gap-2 text-white/55 hover:text-white text-xs transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{languages.find((l) => l.code === language)?.name || 'English'}</span>
                  </button>
                  {showLanguagePicker && (
                    <div
                      className="absolute bottom-full right-0 mb-2 rounded-2xl p-3 min-w-[200px] z-50"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-2">
                        {languages.map((lang) => {
                          const isSelected = language === lang.code;
                          return (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => {
                                triggerHaptic('light');
                                changeLanguage(lang.code, false);
                                setShowLanguagePicker(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-200"
                              style={{
                                background: isSelected
                                  ? 'rgba(139,92,246,0.20)'
                                  : 'rgba(255,255,255,0.06)',
                                border: isSelected
                                  ? '1px solid rgba(139,92,246,0.40)'
                                  : '1px solid rgba(255,255,255,0.10)',
                              }}
                            >
                              <span className="text-2xl">{lang.flag}</span>
                              <div className="flex-1">
                                <div className="text-white text-sm font-medium">{lang.name}</div>
                                <div className="text-white/60 text-xs">{lang.nativeName}</div>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.3)' }}>
                                  <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(139,92,246,1)' }} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-white/55 text-xs">Built to feel like a billion‑dollar product.</div>
              </div>
            </div>
          </GlassCard>
        </MotionInView>
      </div>
    </footer>
  );
}

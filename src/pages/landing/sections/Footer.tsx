import { Link } from 'react-router-dom';
import { GlassCard } from '../../../components/ui/glass/Glass';
import { SocialIcon } from '../../../components/ui/glass/SocialIcon';
import { MotionInView } from '../../../components/ui/motion/MotionInView';

export default function Footer() {
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
              <div className="text-white/55 text-xs">Built to feel like a billion‑dollar product.</div>
            </div>
          </GlassCard>
        </MotionInView>
      </div>
    </footer>
  );
}


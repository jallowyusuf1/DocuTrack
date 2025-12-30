import { Shield, Lock, Eye, FileCheck } from 'lucide-react';
import { MotionInView } from '../../../components/ui/motion/MotionInView';
import { GlassTile } from '../../../components/ui/glass/Glass';

const securityFeatures = [
  {
    title: 'End-to-end protection',
    desc: 'Your documents are encrypted and stored securely. We never access your data.',
    icon: Shield,
  },
  {
    title: 'Secure sessions',
    desc: 'Protected authentication with optional 2FA and session management.',
    icon: Lock,
  },
  {
    title: 'Privacy first',
    desc: 'No tracking, no ads, no data selling. Your privacy is our priority.',
    icon: Eye,
  },
  {
    title: 'Compliance ready',
    desc: 'Built with security best practices and industry standards in mind.',
    icon: FileCheck,
  },
];

export default function Security() {
  return (
    <section id="security" className="relative" style={{ scrollMarginTop: '140px' }}>
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-14">
        <MotionInView preset="fadeUp">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="text-white/70 text-sm">Security & Privacy</div>
              <h2
                className="text-white font-semibold tracking-tight mt-2"
                style={{ fontSize: 'clamp(26px, 3vw, 40px)', letterSpacing: '-0.03em' }}
              >
                Your data. Protected.
              </h2>
            </div>
            <div className="text-white/65 text-sm max-w-md">
              Security and privacy built into every layer.
            </div>
          </div>
        </MotionInView>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <MotionInView key={f.title} delay={0.08 + i * 0.07} preset="scaleIn">
                <GlassTile
                  className="p-6 h-full"
                  style={{
                    borderRadius: 26,
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 60%, rgba(139,92,246,0.08) 100%)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.14)',
                    }}
                  >
                    <Icon className="w-6 h-6 text-white/80" />
                  </div>
                  <div className="text-white font-semibold text-base mb-2">{f.title}</div>
                  <div className="text-white/65 text-sm leading-relaxed">{f.desc}</div>
                </GlassTile>
              </MotionInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}

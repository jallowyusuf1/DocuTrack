import { Lock, Bell, ScanLine, Users } from 'lucide-react';
import { MotionInView } from '../../../components/ui/motion/MotionInView';
import { GlassTile } from '../../../components/ui/glass/Glass';

const features = [
  {
    title: 'Smart expiry engine',
    desc: 'Always know what’s coming up — urgent, soon, upcoming — with clean filters and calendar views.',
    icon: Bell,
  },
  {
    title: 'OCR capture built-in',
    desc: 'Scan documents and extract key fields fast. Less typing. More certainty.',
    icon: ScanLine,
  },
  {
    title: 'Family sharing + permissions',
    desc: 'Share documents with your household. Decide who can view, edit, or share.',
    icon: Users,
  },
  {
    title: 'Security by default',
    desc: 'Protected sessions, strong storage rules, and privacy-first architecture.',
    icon: Lock,
  },
];

export default function Features() {
  return (
    <section id="features" className="relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-14">
        <MotionInView preset="fadeUp">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="text-white/70 text-sm">Our features</div>
              <h2
                className="text-white font-semibold tracking-tight mt-2"
                style={{ fontSize: 'clamp(26px, 3vw, 40px)', letterSpacing: '-0.03em' }}
              >
                Premium workflow. No clutter.
              </h2>
            </div>
            <div className="text-white/65 text-sm max-w-md">
              A short list of what matters most — no fluff.
            </div>
          </div>
        </MotionInView>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.slice(0, 3).map((f, i) => {
            const Icon = f.icon;
            return (
              <MotionInView key={f.title} delay={0.06 + i * 0.06} preset="scaleIn">
                <GlassTile
                  interactive
                  className="p-6"
                  style={{
                    borderRadius: 28,
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)',
                      }}
                    >
                      <Icon className="w-5 h-5 text-white/85" />
                    </div>
                    <div className="text-white font-semibold">{f.title}</div>
                  </div>
                  <div className="mt-3 text-white/65 text-sm leading-relaxed">{f.desc}</div>
                </GlassTile>
              </MotionInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}


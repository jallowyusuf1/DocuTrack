import { BellRing, Camera, FolderKanban } from 'lucide-react';
import { MotionInView } from '../../../components/ui/motion/MotionInView';
import { GlassTile } from '../../../components/ui/glass/Glass';

const steps = [
  {
    title: 'Capture',
    desc: 'Snap a photo, upload a file, or pull from your gallery — in seconds.',
    icon: Camera,
  },
  {
    title: 'Organize',
    desc: 'We auto-label and categorize. You can fine-tune everything anytime.',
    icon: FolderKanban,
  },
  {
    title: 'Stay ahead',
    desc: 'Smart reminders at 30/7/1 days (and custom) so you renew on time.',
    icon: BellRing,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative" style={{ scrollMarginTop: '140px' }}>
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-12">
        <MotionInView preset="fadeUp">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="text-white/70 text-sm">How it works</div>
              <h2
                className="text-white font-semibold tracking-tight mt-2"
                style={{ fontSize: 'clamp(26px, 3vw, 40px)', letterSpacing: '-0.03em' }}
              >
                Three steps. Zero stress.
              </h2>
            </div>
            <div className="text-white/65 text-sm max-w-md">Fast capture, auto-organize, smart reminders.</div>
          </div>
        </MotionInView>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <MotionInView key={s.title} delay={0.08 + i * 0.07} preset="scaleIn">
                <GlassTile
                  className="p-6"
                  style={{
                    borderRadius: 26,
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div className="flex items-center justify-between">
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
                    <div className="text-white/45 text-sm font-medium">0{i + 1}</div>
                  </div>
                  <div className="mt-4 text-white font-semibold text-lg">{s.title}</div>
                  <div className="mt-2 text-white/65 text-sm leading-relaxed">{s.desc}</div>
                </GlassTile>
              </MotionInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}


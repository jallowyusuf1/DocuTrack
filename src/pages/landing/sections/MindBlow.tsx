import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Wand2, Zap, LockKeyhole, Database } from 'lucide-react';
import { MotionInView } from '../../../components/ui/motion/MotionInView';
import { GlassCard, GlassPill, GlassTile } from '../../../components/ui/glass/Glass';
import { prefersReducedMotion } from '../../../utils/animations';

function MindBlowPanel() {
  const reduced = prefersReducedMotion();
  const scenarios = useMemo(
    () => [
      { doc: 'Passport', expires: 'Aug 14, 2027', cadence: ['30 days', '7 days', '1 day'] },
      { doc: 'Car insurance', expires: 'Jan 02, 2026', cadence: ['45 days', '14 days', '3 days'] },
      { doc: 'Work permit', expires: 'Nov 19, 2025', cadence: ['60 days', '21 days', '7 days'] },
    ],
    []
  );
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => setIdx((v) => (v + 1) % scenarios.length), 4600);
    return () => window.clearInterval(t);
  }, [reduced, scenarios.length]);

  const s = scenarios[idx];

  return (
    <GlassCard
      elevated
      className="relative overflow-hidden"
      style={{
        borderRadius: 30,
        padding: 18,
        background:
          'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(255,255,255,0.06) 55%, rgba(59,130,246,0.14) 100%)',
        border: '1px solid rgba(255,255,255,0.14)',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 60%)',
          filter: 'blur(35px)',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <GlassPill className="text-white/85">
            <Sparkles className="w-4 h-4 text-white/70" />
            The mind‑blow moment
          </GlassPill>
          <div className="text-white/55 text-sm">Auto‑scheduled</div>
        </div>

        <div className="mt-4 text-white font-semibold text-lg">Your reminders build themselves.</div>
        <div className="mt-1 text-white/65 text-sm leading-relaxed">
          Based on expiry dates, DocuTrackr generates the right cadence — and adapts when you update anything.
        </div>

        <div className="mt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={s.doc}
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <GlassTile className="p-4" style={{ borderRadius: 24 }}>
                <div className="text-white/80 text-sm">Tracking</div>
                <div className="mt-1 text-white font-semibold text-xl">{s.doc}</div>
                <div className="mt-2 text-white/65 text-sm">Expires: {s.expires}</div>
                <div className="mt-3 h-10 rounded-xl flex items-center px-3 gap-2" style={{ background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <Wand2 className="w-4 h-4 text-white/75" />
                  <span className="text-white/70 text-sm">Reminders generated automatically</span>
                </div>
              </GlassTile>

              <GlassTile className="p-4" style={{ borderRadius: 24 }}>
                <div className="text-white/80 text-sm">Cadence</div>
                <div className="mt-3 space-y-2">
                  {s.cadence.map((c) => (
                    <div
                      key={c}
                      className="flex items-center justify-between rounded-xl px-3 py-2"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                    >
                      <div className="text-white/85 text-sm">{c}</div>
                      <div className="text-white/60 text-xs">before expiry</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 text-white/60 text-xs">
                  <Zap className="w-4 h-4 text-white/70" /> Updates instantly across devices.
                </div>
              </GlassTile>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </GlassCard>
  );
}

function SecurityAndFAQ() {
  const faqs = [
    { q: 'Is my data private?', a: 'Yes. We use Supabase Auth + RLS so your data is scoped to your account.' },
    { q: 'Can I share with family?', a: 'Yes. Invite members, then share documents with permissions.' },
    { q: 'Do reminders work on desktop too?', a: 'Yes. Your reminders sync across devices so you’re always ahead.' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <GlassTile className="p-6" style={{ borderRadius: 28 }}>
        <div id="security" className="flex items-center justify-between">
          <div className="text-white font-semibold text-lg">Security</div>
          <ShieldCheck className="w-5 h-5 text-white/70" />
        </div>
        <div className="mt-3 text-white/65 text-sm leading-relaxed">
          Built with strong defaults: authenticated access, RLS policies, protected storage, and safe session handling.
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: LockKeyhole, t: 'Access control', d: 'Row-level policies keep data scoped.' },
            { icon: Database, t: 'Secure storage', d: 'Buckets + policies, organized per user.' },
          ].map((x) => {
            const Icon = x.icon;
            return (
              <div
                key={x.t}
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Icon className="w-4 h-4 text-white/80" />
                  {x.t}
                </div>
                <div className="mt-1 text-white/65 text-sm">{x.d}</div>
              </div>
            );
          })}
        </div>
      </GlassTile>

      <GlassTile className="p-6" style={{ borderRadius: 28 }}>
        <div id="faq" className="flex items-center justify-between">
          <div className="text-white font-semibold text-lg">FAQ</div>
          <div className="text-white/55 text-sm">Quick answers</div>
        </div>
        <div className="mt-4 space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="rounded-2xl p-4"
              style={{ background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <summary className="cursor-pointer text-white/90 font-medium">{f.q}</summary>
              <div className="mt-2 text-white/65 text-sm leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </GlassTile>
    </div>
  );
}

export default function MindBlow() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-14 md:py-18">
        <MotionInView preset="fadeUp">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="text-white/70 text-sm">One thing that will blow your mind</div>
              <h2
                className="text-white font-semibold tracking-tight mt-2"
                style={{ fontSize: 'clamp(26px, 3vw, 40px)', letterSpacing: '-0.03em' }}
              >
                It feels automated because it is.
              </h2>
            </div>
            <div className="text-white/65 text-sm max-w-md">
              A calm system that nudges you early, often, and exactly when you need it.
            </div>
          </div>
        </MotionInView>

        <div className="mt-8 space-y-4">
          <MotionInView preset="scaleIn" delay={0.08}>
            <MindBlowPanel />
          </MotionInView>
          <MotionInView preset="fadeUp" delay={0.12}>
            <SecurityAndFAQ />
          </MotionInView>
        </div>
      </div>
    </section>
  );
}


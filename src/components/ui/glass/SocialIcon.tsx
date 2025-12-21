import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../../../utils/animations';

type SocialType = 'instagram' | 'tiktok' | 'linkedin' | 'facebook' | 'x';

const brand = {
  instagram: {
    fg: 'rgba(255, 255, 255, 0.92)',
    glow: 'rgba(228, 64, 95, 0.35)',
    // Instagram “sunset” gradient
    gradient:
      'linear-gradient(135deg, rgba(131, 58, 180, 0.55) 0%, rgba(253, 29, 29, 0.45) 45%, rgba(252, 176, 69, 0.45) 100%)',
  },
  tiktok: {
    fg: 'rgba(255, 255, 255, 0.92)',
    glow: 'rgba(37, 244, 238, 0.25)',
    gradient:
      'linear-gradient(135deg, rgba(37, 244, 238, 0.35) 0%, rgba(255, 255, 255, 0.06) 40%, rgba(254, 44, 85, 0.30) 100%)',
  },
  linkedin: {
    fg: 'rgba(255, 255, 255, 0.92)',
    glow: 'rgba(10, 102, 194, 0.30)',
    gradient: 'linear-gradient(135deg, rgba(10, 102, 194, 0.45) 0%, rgba(255,255,255,0.06) 65%)',
  },
  facebook: {
    fg: 'rgba(255, 255, 255, 0.92)',
    glow: 'rgba(24, 119, 242, 0.30)',
    gradient: 'linear-gradient(135deg, rgba(24, 119, 242, 0.45) 0%, rgba(255,255,255,0.06) 65%)',
  },
  x: {
    fg: 'rgba(255, 255, 255, 0.92)',
    glow: 'rgba(255, 255, 255, 0.18)',
    gradient: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 55%)',
  },
} satisfies Record<
  SocialType,
  {
    fg: string;
    glow: string;
    gradient: string;
  }
>;

function Icon({ type }: { type: SocialType }) {
  // Minimal inline SVGs so we don’t need extra deps.
  switch (type) {
    case 'x':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.4L1.1 2h6.4l4.4 5.9L18.9 2Zm-1.1 18h1.7L6.2 3.9H4.4L17.8 20Z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 4.5A5.5 5.5 0 1 1 6.5 14 5.5 5.5 0 0 1 12 8.5Zm0 2A3.5 3.5 0 1 0 15.5 14 3.5 3.5 0 0 0 12 10.5ZM18 6.8a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M16 2c.3 2.6 2.1 4.7 4.7 5V9c-1.8-.1-3.3-.7-4.7-1.7V15a7 7 0 1 1-7-7c.3 0 .6 0 1 .1v2.3c-.3-.1-.6-.2-1-.2a4.6 4.6 0 1 0 4.6 4.6V2h2.4Z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M6.5 6.5A1.9 1.9 0 1 1 6.5 2.7a1.9 1.9 0 0 1 0 3.8ZM4.8 21.3h3.4V8.7H4.8v12.6Zm5.6-12.6h3.3v1.7h.1c.5-1 1.8-2 3.7-2 3.9 0 4.6 2.6 4.6 5.9v7h-3.4v-6.2c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3v6.3h-3.4V8.7Z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.5-1.5H16.7V5c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8V11H6.5v3h2.7v8h4.3Z" />
        </svg>
      );
    default:
      return null;
  }
}

export function SocialIcon({
  type,
  href,
  label,
}: {
  type: SocialType;
  href: string;
  label: string;
}) {
  const reduced = prefersReducedMotion();
  const b = brand[type];
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex items-center justify-center w-11 h-11 rounded-full"
      style={{
        background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.04) 100%), ${b.gradient}`,
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow:
          `0 16px 48px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -10px 22px rgba(0,0,0,0.20)`,
        color: b.fg,
      }}
      whileHover={
        reduced
          ? undefined
          : {
              rotate: 360,
              scale: 1.06,
              y: -2,
              boxShadow: `0 22px 70px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.10), 0 0 42px ${b.glow}, inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -10px 22px rgba(0,0,0,0.18)`,
              filter: 'saturate(1.25)',
              color: 'rgba(255, 255, 255, 0.98)',
            }
      }
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          // “glass highlight” lens flare
          background:
            'radial-gradient(circle at 30% 22%, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.10) 28%, transparent 56%)',
          opacity: 0.9,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          // subtle rim for realism
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
          opacity: 1,
        }}
      />
      <Icon type={type} />
    </motion.a>
  );
}


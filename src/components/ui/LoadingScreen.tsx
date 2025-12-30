import { motion } from 'framer-motion';
import BrandLogo from './BrandLogo';

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
}

export default function LoadingScreen({
  title = 'DocuTrackr',
  subtitle = 'Loading...',
}: LoadingScreenProps) {
  return (
    <div
      className="flex items-center justify-center min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
      }}
    >
      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: 'linear-gradient(135deg, #2563EB, #1E40AF)' }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
        animate={{ x: [0, -40, 0], y: [0, -50, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-20 blur-[120px]"
        style={{ background: 'linear-gradient(135deg, #EC4899, #2563EB)' }}
        animate={{ x: [0, 30, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Loading card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 flex flex-col items-center gap-6 p-8 md:p-10 rounded-3xl"
        style={{
          background: 'rgba(42, 38, 64, 0.75)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow:
            '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 80px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          minWidth: '280px',
          maxWidth: '340px',
        }}
      >
        {/* Tiled glass overlay */}
        <div
          className="absolute inset-0 rounded-3xl opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Logo */}
        <motion.div
          className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center"
          style={{
            background:
              'linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(109, 40, 217, 0.9))',
            boxShadow: '0 0 40px rgba(37, 99, 235, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ border: '2px solid rgba(37, 99, 235, 0.5)' }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <BrandLogo
            className="w-16 h-16 md:w-[72px] md:h-[72px]"
            alt="DocuTrackr Logo"
          />
        </motion.div>

        {/* Spinner */}
        <div className="relative" style={{ width: '32px', height: '32px' }}>
          <motion.div className="absolute inset-0 rounded-full" style={{ border: '3px solid rgba(37, 99, 235, 0.2)' }} />
          <motion.div
            className="absolute inset-0 rounded-full border-3 border-transparent"
            style={{ borderTopColor: '#2563EB', borderRightColor: '#1E40AF' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, transparent 70%)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Text */}
        <div className="text-center">
          <h2
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{
              textShadow: '0 0 30px rgba(37, 99, 235, 0.8), 0 2px 10px rgba(0, 0, 0, 0.5)',
              letterSpacing: '-0.5px',
              fontFamily: 'SF Pro Display, -apple-system, sans-serif',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #60A5FA 50%, #2563EB 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {title}
            </span>
          </h2>
          <motion.p
            className="text-sm md:text-base"
            style={{ color: '#60A5FA', fontFamily: 'SF Pro Text, -apple-system, sans-serif' }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: 'rgba(37, 99, 235, 0.6)',
                boxShadow: '0 0 8px rgba(37, 99, 235, 0.8)',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}



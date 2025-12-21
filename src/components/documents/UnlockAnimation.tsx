import React, { useEffect, useState } from 'react';
import { Key, FolderOpen, Unlock } from 'lucide-react';

interface UnlockAnimationProps {
  onComplete: () => void;
}

export const UnlockAnimation: React.FC<UnlockAnimationProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'key-appear' | 'key-enter' | 'folder-open' | 'blur-dissolve' | 'complete'>('key-appear');

  useEffect(() => {
    const timings = {
      'key-appear': 800,
      'key-enter': 500,
      'folder-open': 500,
      'blur-dissolve': 700,
    };

    const transitions = [
      { from: 'key-appear', to: 'key-enter', delay: 800 },
      { from: 'key-enter', to: 'folder-open', delay: 500 },
      { from: 'folder-open', to: 'blur-dissolve', delay: 500 },
      { from: 'blur-dissolve', to: 'complete', delay: 700 },
    ];

    const currentTransition = transitions.find(t => t.from === stage);
    if (!currentTransition) return;

    const timer = setTimeout(() => {
      setStage(currentTransition.to as any);
      if (currentTransition.to === 'complete') {
        setTimeout(onComplete, 100);
      }
    }, currentTransition.delay);

    return () => clearTimeout(timer);
  }, [stage, onComplete]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
      {/* Background gradient (fades out during blur-dissolve) */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-br from-[#1A0B2E] to-[#2D1B4E]
          transition-opacity duration-700
          ${stage === 'blur-dissolve' || stage === 'complete' ? 'opacity-0' : 'opacity-100'}
        `}
      />

      {/* Blurred background (dissolves during blur-dissolve) */}
      <div
        className={`
          absolute inset-0 transition-all duration-700
          ${stage === 'blur-dissolve' || stage === 'complete' ? 'opacity-0 blur-0' : 'opacity-40 blur-[30px]'}
        `}
      >
        <div className="absolute inset-0 bg-purple-500/15" />
      </div>

      {/* Animation container */}
      <div className="relative z-10">
        {/* Folder with lock */}
        <div className="relative flex items-center justify-center">
          {/* Folder */}
          <div
            className={`
              relative w-[200px] h-[160px]
              transition-all duration-500
              ${stage === 'folder-open' ? 'scale-110' : 'scale-100'}
              ${stage === 'blur-dissolve' || stage === 'complete' ? 'opacity-0 scale-90' : 'opacity-100'}
            `}
          >
            {/* Folder back (stays in place) */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg"
              style={{
                boxShadow: '0 20px 60px rgba(139, 92, 246, 0.4)',
              }}
            >
              <div className="absolute -top-3 left-4 w-24 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-t-lg" />
            </div>

            {/* Folder top (opens) */}
            <div
              className={`
                absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg origin-bottom
                transition-all duration-500
                ${stage === 'folder-open' || stage === 'blur-dissolve' || stage === 'complete'
                  ? 'rotate-x-[-120deg] opacity-70'
                  : 'rotate-x-0 opacity-0'
                }
              `}
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            />

            {/* Papers inside (peek when folder opens) */}
            <div
              className={`
                absolute inset-4 flex flex-col gap-2 transition-all duration-500
                ${stage === 'folder-open' ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <div className="w-full h-6 bg-white/20 rounded" />
              <div className="w-3/4 h-6 bg-white/15 rounded" />
              <div className="w-5/6 h-6 bg-white/10 rounded" />
            </div>

            {/* Purple glow from inside */}
            <div
              className={`
                absolute inset-0 bg-purple-400/40 rounded-lg blur-2xl
                transition-all duration-500
                ${stage === 'folder-open' ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}
              `}
            />

            {/* Lock icon (rotates when unlocking) */}
            <div
              className={`
                absolute -bottom-4 -right-4 transition-all duration-500
                ${stage === 'key-enter' ? 'rotate-90' : 'rotate-0'}
                ${stage === 'folder-open' || stage === 'blur-dissolve' || stage === 'complete' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}
              `}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/30 blur-xl rounded-full" />
                <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-full transform -rotate-12">
                  <Unlock className="w-8 h-8 text-yellow-900" />
                </div>
              </div>
            </div>
          </div>

          {/* Golden Key */}
          <div
            className={`
              absolute top-0 transition-all duration-800
              ${stage === 'key-appear'
                ? 'opacity-100 scale-120 -translate-y-32 rotate-[360deg]'
                : stage === 'key-enter'
                ? 'opacity-100 scale-100 translate-y-0 rotate-0'
                : 'opacity-0 scale-50'
              }
            `}
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
              transformOrigin: 'center',
            }}
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-yellow-400/50 blur-2xl rounded-full scale-150 animate-key-glow" />

              {/* Key icon */}
              <div
                className={`
                  relative bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 p-6 rounded-lg
                  transform transition-all duration-500
                  ${stage === 'key-enter' ? 'rotate-90' : 'rotate-0'}
                `}
                style={{
                  boxShadow: '0 12px 40px rgba(234, 179, 8, 0.6)',
                }}
              >
                <Key className="w-12 h-12 text-yellow-900" />
              </div>

              {/* Sparkles */}
              {stage === 'key-appear' && (
                <>
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-200 rounded-full animate-sparkle-1" />
                  <div className="absolute -top-4 left-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-sparkle-2" />
                  <div className="absolute top-1/2 -left-3 w-2 h-2 bg-yellow-200 rounded-full animate-sparkle-3" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Success message */}
        <div
          className={`
            mt-12 text-center transition-all duration-500
            ${stage === 'folder-open' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <div className="text-2xl font-bold text-white mb-2">Unlocked!</div>
          <div className="text-sm text-white/70">Welcome back</div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes keyGlow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes sparkle1 {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(-10px, -10px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-20px, -20px) scale(0);
          }
        }

        @keyframes sparkle2 {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(0, -15px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(0, -30px) scale(0);
          }
        }

        @keyframes sparkle3 {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(-15px, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-30px, 0) scale(0);
          }
        }

        .animate-key-glow {
          animation: keyGlow 1.5s ease-in-out infinite;
        }

        .animate-sparkle-1 {
          animation: sparkle1 1s ease-out infinite;
        }

        .animate-sparkle-2 {
          animation: sparkle2 1s ease-out 0.2s infinite;
        }

        .animate-sparkle-3 {
          animation: sparkle3 1s ease-out 0.4s infinite;
        }

        .rotate-x-\[-120deg\] {
          transform: perspective(1000px) rotateX(-120deg);
        }

        .scale-120 {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

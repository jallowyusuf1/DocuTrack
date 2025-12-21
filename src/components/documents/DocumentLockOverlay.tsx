import React, { useEffect, useState } from 'react';
import { Fingerprint, Lock, Eye, EyeOff } from 'lucide-react';
import { documentLockService } from '../../services/documentLockService';
import { useAuth } from '../../hooks/useAuth';
import { idleSecurityService } from '../../services/idleSecurityService';
import { webauthnService } from '../../services/webauthnService';

interface DocumentLockOverlayProps {
  onUnlock: () => void;
}

export const DocumentLockOverlay: React.FC<DocumentLockOverlayProps> = ({ onUnlock }) => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [passkeysCount, setPasskeysCount] = useState(0);
  const [isBiometricUnlocking, setIsBiometricUnlocking] = useState(false);

  // Check lockout status on mount
  useEffect(() => {
    const checkLockout = () => {
      if (documentLockService.isLockedOut()) {
        setIsLockedOut(true);
        const remaining = documentLockService.getRemainingLockoutTime();
        setLockoutTimeRemaining(remaining);
      } else {
        setIsLockedOut(false);
        setLockoutTimeRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);

    return () => clearInterval(interval);
  }, []);

  // Load biometric capability (shared toggle + passkeys)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) return;
      try {
        const s = await idleSecurityService.getSettings(user.id);
        if (cancelled) return;
        setBiometricEnabled(!!s.biometricUnlockEnabled && webauthnService.isSupported());
        try {
          const keys = await webauthnService.listPasskeys(user.id);
          if (!cancelled) setPasskeysCount(keys.length);
        } catch {
          if (!cancelled) setPasskeysCount(0);
        }
      } catch {
        if (!cancelled) {
          setBiometricEnabled(false);
          setPasskeysCount(0);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Format lockout time
  const formatLockoutTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUnlock = async () => {
    if (!user || isUnlocking || isLockedOut) return;

    setError('');
    setIsUnlocking(true);

    try {
      const result = await documentLockService.attemptUnlock(user.id, password);

      if (result.success) {
        // Success - trigger unlock animation
        onUnlock();
      } else {
        // Failed
        setPassword('');
        setIsShaking(true);

        if (result.error === 'locked_out') {
          setIsLockedOut(true);
          const remaining = documentLockService.getRemainingLockoutTime();
          setLockoutTimeRemaining(remaining);
          setError('Too many failed attempts');
        } else if (result.error === 'incorrect_password') {
          setError('Incorrect password');
          setAttemptsRemaining(result.attemptsRemaining ?? null);
        } else {
          setError('Unable to unlock. Please try again.');
        }

        setTimeout(() => setIsShaking(false), 500);
      }
    } catch (err) {
      console.error('Unlock error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleBiometricUnlock = async () => {
    if (!user || isLockedOut || isBiometricUnlocking) return;
    setError('');
    setIsBiometricUnlocking(true);
    try {
      await webauthnService.authenticate();
      onUnlock();
    } catch (e) {
      setIsShaking(true);
      setError('Face ID / Passkey failed. Try your password.');
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setIsBiometricUnlocking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLockedOut) {
      handleUnlock();
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Dark purple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A0B2E] to-[#2D1B4E]" />

      {/* Blurred content preview */}
      <div className="absolute inset-0 opacity-40 blur-[30px]">
        <div className="absolute inset-0 bg-purple-500/15" />
      </div>

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4">
        {/* 3D Folder with Lock Icon */}
        <div className="mb-12 animate-folder-float">
          <div className="relative">
            {/* Folder */}
            <div className="relative w-48 h-32 md:w-56 md:h-40 lg:w-[200px] lg:h-[160px]">
              {/* Folder back */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg transform perspective-1000 rotate-y-3"
                   style={{
                     boxShadow: '0 20px 60px rgba(139, 92, 246, 0.4)',
                     background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'
                   }}>
                {/* Folder tab */}
                <div className="absolute -top-3 left-4 w-24 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-t-lg" />

                {/* Folder details */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-1/2 border-2 border-purple-300/30 rounded-md" />
                </div>
              </div>

              {/* Lock icon overlay */}
              <div className={`absolute -bottom-4 -right-4 ${isShaking ? 'animate-shake-lock' : ''}`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/30 blur-xl rounded-full animate-glow-pulse" />
                  <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-full transform -rotate-12"
                       style={{ boxShadow: '0 8px 32px rgba(234, 179, 8, 0.5)' }}>
                    <Lock className="w-8 h-8 text-yellow-900" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liquid Glass Password Card */}
        <div
          className={`
            w-full max-w-[360px] md:max-w-[400px] lg:max-w-[480px]
            bg-white/8 backdrop-blur-[40px] backdrop-saturate-[180%]
            border border-white/15 rounded-[28px] p-8
            shadow-[0_16px_48px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,255,255,0.1)]
            transform transition-all duration-600 ease-out
            ${isShaking ? 'animate-shake' : ''}
            ${isUnlocking ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}
          `}
          style={{
            animation: 'cardEntrance 0.6s ease-out 0.3s backwards',
          }}
        >
          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            {isLockedOut ? 'Too Many Attempts' : 'Enter Password'}
          </h2>

          {/* Subtitle */}
          <p className="text-[15px] text-white/70 text-center mb-6">
            {isLockedOut ? 'Try again later' : 'Unlock your documents'}
          </p>

          {isLockedOut ? (
            <>
              {/* Lockout countdown */}
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-5xl font-bold text-white mb-4 tabular-nums">
                  {formatLockoutTime(lockoutTimeRemaining)}
                </div>
                <p className="text-sm text-white/60">Time remaining</p>
              </div>

              {/* Contact support link */}
              <button className="w-full text-sm text-purple-400 hover:text-purple-300 transition-colors text-center mt-4">
                Contact Support
              </button>
            </>
          ) : (
            <>
              {/* Password Input */}
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-5 h-5 text-white/70" />
                </div>

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
                  disabled={isUnlocking}
                  className={`
                    w-full h-14 px-12 pr-14
                    bg-white/12 border rounded-2xl
                    text-lg text-white placeholder:text-white/50
                    focus:outline-none focus:ring-4 focus:ring-purple-500/30
                    transition-all duration-200
                    ${error ? 'border-red-500 focus:border-red-500' : 'border-white/20 focus:border-purple-500'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  autoFocus
                />

                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="w-6 h-6" />
                  ) : (
                    <Eye className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-3 text-sm text-red-400 text-center animate-fade-in">
                  {error}
                </div>
              )}

              {/* Attempts remaining */}
              {attemptsRemaining !== null && attemptsRemaining > 0 && (
                <div className={`mt-2 text-xs text-center ${attemptsRemaining === 1 ? 'text-red-400' : 'text-white/60'}`}>
                  Attempts remaining: {attemptsRemaining}
                </div>
              )}

              {/* Unlock Button */}
              <button
                onClick={handleUnlock}
                disabled={isUnlocking || !password}
                className={`
                  w-full h-14 mt-4 rounded-2xl
                  bg-gradient-to-br from-purple-500 to-purple-700
                  text-white text-lg font-semibold
                  shadow-[0_8px_24px_rgba(139,92,246,0.5)]
                  hover:brightness-110 hover:scale-[1.02]
                  active:scale-[0.98]
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                `}
              >
                {isUnlocking ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Unlocking...
                  </div>
                ) : (
                  'Unlock'
                )}
              </button>

              {/* Face ID / Passkey */}
              {biometricEnabled && passkeysCount > 0 && (
                <button
                  onClick={handleBiometricUnlock}
                  disabled={isUnlocking || isBiometricUnlocking || isLockedOut}
                  className={`
                    w-full h-14 mt-3 rounded-2xl
                    bg-white/10 border border-white/15
                    text-white text-base font-semibold
                    hover:bg-white/14 hover:scale-[1.01]
                    active:scale-[0.98]
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    flex items-center justify-center gap-2
                  `}
                >
                  {isBiometricUnlocking ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating…
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-5 h-5 text-white/90" />
                      Use Face ID / Passkey
                    </>
                  )}
                </button>
              )}

              {/* Forgot Password Link */}
              <button className="w-full mt-4 text-sm text-white/70 hover:text-white transition-colors text-center">
                Forgot password?
              </button>
            </>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes folderFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes cardEntrance {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        @keyframes shakeLock {
          0%, 100% { transform: rotate(-12deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-18deg); }
          20%, 40%, 60%, 80% { transform: rotate(-6deg); }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-folder-float {
          animation: folderFloat 3s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s;
        }

        .animate-shake-lock {
          animation: shakeLock 0.5s;
        }

        .animate-glow-pulse {
          animation: glowPulse 1.5s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { DesktopModal } from './DesktopModal';

interface LoadingOverlayProps {
  isOpen: boolean;
  onClose?: () => void;
  message?: string;
  showProgress?: boolean;
  progress?: number;
  speed?: string;
  eta?: string;
  allowCancel?: boolean;
  onCancel?: () => void;
}

export default function LoadingOverlay({
  isOpen,
  onClose,
  message = 'Loading...',
  showProgress = false,
  progress = 0,
  speed,
  eta,
  allowCancel = false,
  onCancel,
}: LoadingOverlayProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancel = () => {
    if (allowCancel && onCancel) {
      setShowCancelConfirm(true);
    }
  };

  const confirmCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setShowCancelConfirm(false);
  };

  return (
    <>
      <DesktopModal
        isOpen={isOpen}
        onClose={() => {
          if (allowCancel && onClose) {
            onClose();
          }
        }}
        preventBackdropClose={!allowCancel}
      >
        <div
          className="bg-white dark:bg-gray-800 flex flex-col items-center justify-center"
          style={{
            width: '320px',
            height: '320px',
            padding: '48px',
          }}
        >
          {/* Spinner */}
          <div className="relative mb-8">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #8b5cf6, #3b82f6, #8b5cf6)',
                animation: 'spin 1.5s linear infinite',
              }}
            />
            <div
              className="absolute inset-1 bg-white dark:bg-gray-800 rounded-full"
            />
            <Loader2
              size={64}
              className="relative text-purple-500"
              style={{
                animation: 'spin 1s linear infinite',
              }}
            />
          </div>

          {/* Message */}
          <p className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-6">
            {message}
          </p>

          {/* Progress Bar */}
          {showProgress && (
            <div className="w-full space-y-3">
              {/* Progress Bar */}
              <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  <div
                    className="absolute inset-0 bg-white/30"
                    style={{
                      animation: 'shimmer 1.5s infinite',
                    }}
                  />
                </div>
              </div>

              {/* Percentage */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {Math.round(progress)}%
                </span>
                {speed && (
                  <span className="text-gray-600 dark:text-gray-400">
                    {speed}
                  </span>
                )}
              </div>

              {/* ETA */}
              {eta && (
                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  {eta} remaining
                </p>
              )}
            </div>
          )}

          {/* Cancel Button */}
          {allowCancel && (
            <button
              onClick={handleCancel}
              className="mt-6 px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}

          <style>{`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }

            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
          `}</style>
        </div>
      </DesktopModal>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(30px)',
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl p-8"
            style={{
              width: '420px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="flex justify-center mb-6">
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
                }}
              >
                <X size={40} className="text-red-500" />
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-2">
              Cancel Operation?
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              This will stop the current operation. Are you sure?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Continue
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
              >
                Cancel Operation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook for managing loading state
export const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<string | undefined>();
  const [eta, setEta] = useState<string | undefined>();

  const showLoading = (
    message: string = 'Loading...',
    options?: {
      progress?: number;
      speed?: string;
      eta?: string;
    }
  ) => {
    setIsLoading(true);
    setLoadingMessage(message);
    setProgress(options?.progress || 0);
    setSpeed(options?.speed);
    setEta(options?.eta);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setProgress(0);
    setSpeed(undefined);
    setEta(undefined);
  };

  const updateProgress = (
    progress: number,
    options?: {
      speed?: string;
      eta?: string;
    }
  ) => {
    setProgress(progress);
    setSpeed(options?.speed);
    setEta(options?.eta);
  };

  return {
    isLoading,
    loadingMessage,
    progress,
    speed,
    eta,
    showLoading,
    hideLoading,
    updateProgress,
  };
};


import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, FileText, MoreVertical, Download, RefreshCw, Trash2, Lock, Unlock, Eye, AlertCircle } from 'lucide-react';
import type { Document } from '../../types';
import { formatDate, getDaysUntil, getUrgencyLevel, type UrgencyLevel } from '../../utils/dateUtils';
import { useImageUrl } from '../../hooks/useImageUrl';
import { triggerHaptic } from '../../utils/animations';
import { useState, useEffect, useRef } from 'react';
import QuickNotes from './QuickNotes';
import LockedDocumentOverlay from './LockedDocumentOverlay';
import BlurBar from './BlurBar';
import UnlockModal from './UnlockModal';
import SetPasswordModal from './SetPasswordModal';
import VerifyPasswordModal from './VerifyPasswordModal';
import { documentService } from '../../services/documents';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import RenewalModal from './RenewalModal';
import { supabase } from '../../config/supabase';

interface DocumentGridCardProps {
  document: Document;
}

const DOCUMENT_TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  passport: FileText,
  visa: FileText,
  id_card: FileText,
  insurance: FileText,
  subscription: FileText,
  receipt: FileText,
  bill: FileText,
  contract: FileText,
  other: FileText,
};

const getUrgencyColor = (urgency: UrgencyLevel, daysLeft: number): string => {
  if (daysLeft < 0) return '#EF4444';
  switch (urgency) {
    case 'urgent':
      return '#EF4444';
    case 'soon':
      return '#F97316';
    case 'upcoming':
      return '#EAB308';
    default:
      return '#10B981';
  }
};

const formatDocumentType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Purple gradient theme for all document type badges
const getDocumentTypeColor = (type: string): { bg: string; border: string; text: string } => {
  // All document types use purple gradient to match app theme
  return {
    bg: 'rgba(139, 92, 246, 0.25)',
    border: 'rgba(167, 139, 250, 0.6)',
    text: '#C4B5FD',
  };
};

export default function DocumentGridCard({ document }: DocumentGridCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [daysLeft, setDaysLeft] = useState(() => getDaysUntil(document.expiration_date));
  const urgency = getUrgencyLevel(document.expiration_date);
  const urgencyColor = getUrgencyColor(urgency, daysLeft);
  const isUrgent = urgency === 'urgent' || daysLeft < 0;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isSetPasswordModalOpen, setIsSetPasswordModalOpen] = useState(false);
  const [isVerifyPasswordModalOpen, setIsVerifyPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const Icon = DOCUMENT_TYPE_ICONS[document.document_type] || FileText;
  const typeLabel = formatDocumentType(document.document_type);
  const typeColors = getDocumentTypeColor(document.document_type);
  
  // Get signed URL for image
  const { signedUrl: imageUrl, loading: imageLoading } = useImageUrl(document.image_url);
  const [imageError, setImageError] = useState(false);

  // Update days left in real-time - recalculate every day
  useEffect(() => {
    // Calculate initial days left
    const updateDaysLeft = () => {
      const newDaysLeft = getDaysUntil(document.expiration_date);
      setDaysLeft(newDaysLeft);
    };

    // Update immediately
    updateDaysLeft();

    // Calculate time until midnight (next day)
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    let intervalId: NodeJS.Timeout | null = null;

    // Set timeout to update at midnight, then set up interval
    const timeoutId = setTimeout(() => {
      updateDaysLeft();
      // Then update every 24 hours
      intervalId = setInterval(updateDaysLeft, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [document.expiration_date]);

  // Check if user has password set
  useEffect(() => {
    const checkPassword = async () => {
      if (!user?.id) return;
      
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('lock_password_hash')
          .eq('user_id', user.id)
          .single();
        
        setHasPassword(!!profile?.lock_password_hash);
      } catch (error) {
        console.error('Failed to check password:', error);
        setHasPassword(false);
      }
    };

    checkPassword();
  }, [user]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleClick = () => {
    if (document.is_locked) {
      triggerHaptic('medium');
      // Check if password exists
      if (hasPassword === false) {
        setIsSetPasswordModalOpen(true);
      } else {
        setIsUnlockModalOpen(true);
      }
    } else {
    triggerHaptic('light');
    navigate(`/documents/${document.id}`);
    }
  };

  const handleUnlock = async () => {
    if (!user?.id) return;
    
    // Check if password exists
    if (hasPassword === false) {
      // No password set, show create password modal
      setIsUnlockModalOpen(false);
      setIsSetPasswordModalOpen(true);
      return;
    }
    
    // Password exists, unlock after verification (handled by UnlockModal)
    try {
      await documentService.unlockDocument(document.id, user.id);
      showToast('Document unlocked', 'success');
      setIsUnlockModalOpen(false);
      setHasPassword(true); // Update state
      window.location.reload();
    } catch (error: any) {
      showToast('Failed to unlock document', 'error');
    }
  };

  const handlePasswordSet = async () => {
    setHasPassword(true);
    // After setting password, unlock the document
    if (document.is_locked) {
      await handleUnlock();
    }
  };

  const handleLockToggle = async () => {
    if (!user?.id || isLocking) return;
    
    setIsMenuOpen(false);
    
    // Check if password exists
    if (hasPassword === false) {
      // No password set, show create password modal
      setIsSetPasswordModalOpen(true);
      return;
    }
    
    // Password exists, show verify modal
    setIsVerifyPasswordModalOpen(true);
  };

  const handlePasswordVerified = async () => {
    if (!user?.id) return;
    
    setIsLocking(true);
    
    try {
      if (document.is_locked) {
        await documentService.unlockDocument(document.id, user.id);
        showToast('Document unlocked', 'success');
      } else {
        await documentService.lockDocument(document.id, user.id);
        showToast('Document locked', 'success');
      }
      setIsVerifyPasswordModalOpen(false);
      window.location.reload();
    } catch (error: any) {
      showToast('Failed to toggle lock', 'error');
    } finally {
      setIsLocking(false);
    }
  };

  const handleDownload = async () => {
    // Download functionality - would need image URL
    showToast('Download feature coming soon', 'info');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="overflow-hidden w-full h-[460px] flex flex-col cursor-pointer touch-manipulation rounded-3xl"
      style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Document Image Section */}
      <div className="relative h-[220px] overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={document.document_name}
            className="w-full h-full object-cover"
            style={{
              filter: document.is_locked
                ? 'blur(20px) brightness(0.5) contrast(0.8)'
                : 'none',
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-16 h-16 text-white/20" />
          </div>
        )}

        {/* Lock overlay */}
        {document.is_locked && (
          <LockedDocumentOverlay showLabel={true} size="medium" />
        )}

        {/* 3-dot menu (top-right) */}
        <div className="absolute top-3 right-3 z-30" ref={menuRef}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              setIsMenuOpen(!isMenuOpen);
            }}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: 'rgba(26, 22, 37, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            }}
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </motion.button>

          {/* Menu Dropdown */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-12 right-0 w-[200px] rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(26, 22, 37, 0.95)',
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                }}
              >
                {!document.is_locked && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload();
                        setIsMenuOpen(false);
                      }}
                      className="w-full h-12 px-4 flex items-center gap-3 hover:bg-purple-500/20 transition-colors border-b border-white/10"
                    >
                      <Download className="w-4 h-4 text-white" />
                      <span className="text-sm text-white">Download Image</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRenewalModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full h-12 px-4 flex items-center gap-3 hover:bg-purple-500/20 transition-colors border-b border-white/10"
                    >
                      <RefreshCw className="w-4 h-4 text-white" />
                      <span className="text-sm text-white">Mark as Renewed</span>
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLockToggle();
                  }}
                  disabled={isLocking}
                  className="w-full h-12 px-4 flex items-center gap-3 hover:bg-purple-500/20 transition-colors border-b border-white/10"
                >
                  {document.is_locked ? (
                    <>
                      <Unlock className="w-4 h-4 text-white" />
                      <span className="text-sm text-white">{isLocking ? 'Unlocking...' : 'Unlock Document'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-white" />
                      <span className="text-sm text-white">{isLocking ? 'Locking...' : 'Lock Document'}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full h-12 px-4 flex items-center gap-3 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">Delete Document</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Urgency Bar */}
      <div
        className="h-1.5 w-full"
        style={{
          background: urgencyColor,
          boxShadow: `0 0 15px ${urgencyColor}80`,
        }}
      />

      {/* Content Section */}
      <div className="flex-1 px-4 py-4 flex flex-col">
        {/* Document Name */}
        <h3 className="text-white font-semibold text-lg line-clamp-2 mb-2">
          {document.document_name}
        </h3>

        {/* Badge and Document Number Row */}
        <div className="flex items-center gap-2 mb-3">
          {/* Document type badge */}
          <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium">
            {typeLabel}
          </span>

          {/* Document Number */}
          {document.document_number && (
            <span className="text-white/50 text-xs line-clamp-1">
              #{document.document_number}
            </span>
          )}
        </div>

        {/* Expiry Info */}
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" style={{ color: urgencyColor }} />
            <span className="text-sm font-medium" style={{ color: urgencyColor }}>
              {daysLeft < 0
                ? 'Expired'
                : daysLeft === 0
                ? 'Expires today'
                : `${daysLeft} days left`}
            </span>
          </div>
          <div className="text-white/50 text-xs">
            Expires: {formatDate(document.expiration_date)}
          </div>
        </div>
      </div>

      {/* Unlock Modal - Only show if password exists */}
      {hasPassword && (
        <UnlockModal
          isOpen={isUnlockModalOpen}
          onClose={() => setIsUnlockModalOpen(false)}
          onUnlock={handleUnlock}
          documentName={document.document_name}
        />
      )}

      {/* Set Password Modal - For first-time password creation */}
      <SetPasswordModal
        isOpen={isSetPasswordModalOpen}
        onClose={() => setIsSetPasswordModalOpen(false)}
        onPasswordSet={handlePasswordSet}
      />

      {/* Verify Password Modal - For locking/unlocking with existing password */}
      <VerifyPasswordModal
        isOpen={isVerifyPasswordModalOpen}
        onClose={() => setIsVerifyPasswordModalOpen(false)}
        onVerified={handlePasswordVerified}
        action={document.is_locked ? 'unlock' : 'lock'}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (!user?.id) return;
          try {
            await documentService.deleteDocument(document.id, user.id);
            showToast('Document deleted', 'success');
            setIsDeleteModalOpen(false);
            window.location.reload();
          } catch (error: any) {
            showToast('Failed to delete document', 'error');
          }
        }}
        documentName={document.document_name}
      />

      {/* Renewal Modal */}
      <RenewalModal
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        onRenew={async (newExpirationDate: string) => {
          if (!user?.id) return;
          try {
            await documentService.updateDocument(document.id, user.id, {
              expiration_date: newExpirationDate,
            } as any);
            showToast('Document renewed', 'success');
            setIsRenewalModalOpen(false);
            window.location.reload();
          } catch (error: any) {
            showToast('Failed to renew document', 'error');
          }
        }}
        documentName={document.document_name}
        currentExpirationDate={document.expiration_date}
      />
    </motion.div>
  );
}

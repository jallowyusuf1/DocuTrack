import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit, Eye, FileText, MoreVertical, RefreshCw, Share2 } from 'lucide-react';
import type { Document } from '../../types';
import { getDaysUntil, getUrgencyLevel, type UrgencyLevel } from '../../utils/dateUtils';
import { useImageUrl } from '../../hooks/useImageUrl';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { documentService } from '../../services/documents';
import { triggerHaptic } from '../../utils/animations';
import RenewalModal from './RenewalModal';
import { LiquidGlowDot, LiquidPill, LiquidPillMedia } from '../ui/liquid';

interface DashboardDocumentCardProps {
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

const formatDocumentType = (type: string): string => {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const getUrgencyColor = (urgency: UrgencyLevel, daysLeft: number) => {
  if (daysLeft < 0) return '#FF453A';
  if (urgency === 'urgent') return '#FF453A';
  if (urgency === 'soon') return '#FF9F0A';
  if (urgency === 'upcoming') return '#FFD60A';
  return '#34C759';
};

export default function DashboardDocumentCard({ document }: DashboardDocumentCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const daysUntil = getDaysUntil(document.expiration_date);
  const urgency = getUrgencyLevel(document.expiration_date);
  const urgencyColor = getUrgencyColor(urgency, daysUntil);

  const typeLabel = formatDocumentType(document.document_type);
  const Icon = DOCUMENT_TYPE_ICONS[document.document_type] || FileText;

  const { signedUrl: imageUrl, loading: imageLoading } = useImageUrl(document.image_url);
  const [imageError, setImageError] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  const handleOpen = () => {
    triggerHaptic('light');
    navigate(`/documents/${document.id}`);
  };

  const daysText =
    daysUntil === 0
      ? 'Expires today'
      : daysUntil === 1
      ? '1 day left'
      : daysUntil < 0
      ? `${Math.abs(daysUntil)} days overdue`
      : `${daysUntil} days left`;

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    triggerHaptic('light');
    navigate(`/documents/${document.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    triggerHaptic('light');
    navigate(`/documents/${document.id}/edit`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    triggerHaptic('medium');

    if (!navigator.share) {
      showToast('Sharing is not supported on this device', 'info');
      return;
    }

    try {
      await navigator.share({
        title: document.document_name,
        text: `Check out my ${typeLabel}`,
      });
      showToast('Shared', 'success');
    } catch {
      // user cancelled
    }
  };

  const handleRenew = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    triggerHaptic('medium');
    setIsRenewalModalOpen(true);
  };

  const handleRenewConfirm = async (documentId: string, newExpirationDate: string) => {
    if (!user?.id) throw new Error('Not authenticated');
    await documentService.updateDocument(documentId, user.id, { expiration_date: newExpirationDate });
    showToast('Document renewed', 'success');
    window.dispatchEvent(new Event('refreshDashboard'));
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <LiquidPill
          interactive
          tone="milky"
          glowColor={urgencyColor}
          onClick={handleOpen}
          className="px-4 py-3 md:px-5 md:py-4"
          style={{ fontFamily: 'SF Pro Text, -apple-system, sans-serif' }}
        >
          <div className="flex items-center gap-4">
            <LiquidPillMedia className="w-[66px] h-[66px] md:w-[72px] md:h-[72px] flex-shrink-0" glowColor={urgencyColor}>
              {imageLoading && !imageError ? (
                <div className="w-full h-full bg-white/5 animate-pulse" />
              ) : imageUrl && !imageError ? (
                <img
                  src={imageUrl}
                  alt={document.document_name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(34,211,238,0.18) 0%, rgba(59,130,246,0.16) 45%, rgba(139,92,246,0.18) 100%)',
                  }}
                >
                  <Icon className="w-8 h-8 text-white/85" />
                </div>
              )}
            </LiquidPillMedia>

            <div className="flex-1 min-w-0">
              <div
                className="text-white font-bold truncate"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, sans-serif',
                  letterSpacing: '-0.24px',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                }}
              >
                {document.document_name}
              </div>

              <div className="mt-1 flex items-center gap-2 min-w-0">
                <div className="text-xs text-white/60 truncate">{typeLabel}</div>
                <span className="text-white/25">•</span>
                <div className="text-xs font-semibold" style={{ color: urgencyColor, textShadow: `0 0 12px ${urgencyColor}55` }}>
                  {daysText}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LiquidGlowDot color={urgencyColor} className="hidden sm:inline-block" />

              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    setIsMenuOpen((v) => !v);
                  }}
                  className="glass-pill w-10 h-10 flex items-center justify-center"
                  aria-label="More actions"
                  title="More actions"
                >
                  <MoreVertical className="w-4 h-4 text-white/90 relative" />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-12 rounded-2xl overflow-hidden z-50 min-w-[190px]"
                      style={{
                        background: 'rgba(18, 14, 28, 0.68)',
                        backdropFilter: 'blur(26px)',
                        WebkitBackdropFilter: 'blur(26px)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        boxShadow: '0 22px 70px rgba(0,0,0,0.62), 0 0 60px rgba(139,92,246,0.20)',
                      }}
                    >
                      {[
                        { label: 'View', icon: Eye, onClick: handleView },
                        { label: 'Edit', icon: Edit, onClick: handleEdit },
                        { label: 'Share', icon: Share2, onClick: handleShare },
                        { label: 'Renew', icon: RefreshCw, onClick: handleRenew },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={item.onClick}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left text-white/90 hover:bg-white/10 transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-white/80" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </LiquidPill>
      </motion.div>

      <RenewalModal
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        document={document}
        onConfirm={handleRenewConfirm}
      />
    </>
  );
}

